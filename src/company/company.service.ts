import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';
import { Company } from './model/company.model';
import { Section } from './model/section.model';
import { Person3Service } from 'src/person3/person3.service';
import { CompanyEntityName } from './model/entityName.enum';

export interface List {
  count: number;
  companies: Partial<Company>[];
}

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel('Company') private readonly companyModel: Model<Company>,
    @InjectModel('Section') private readonly sectionModel: Model<Section>,
    private personService: Person3Service,
  ) {}
  async createCompany(body) {
    delete body._id;
    const newCompany = new this.companyModel(body);
    await newCompany.save();

    return newCompany;
  }
  async getPersonsBySection(id) {
    return await this.personService.findBySectionID(id);
  }
  async addSection(body) {
    const newSection = new this.sectionModel(body);
    await newSection.save();
    return await this.sectionModel
      .findById(newSection._id)
      .populate('persons')
      .exec();
  }
  async updateSection(id: ObjectId, set): Promise<Section> {
    // just updates one company
    const updatedSection = await this.sectionModel.findOneAndUpdate(
      { _id: id },
      set,
      { new: true },
    );
    return updatedSection;
  }
  async delSection(id: string) {
    const deletedSection = await this.sectionModel.findByIdAndRemove(id);
    return deletedSection;
  }
  async getAllCompaniesTypes() {
    const allTypes = Object.keys(CompanyEntityName);
    console.log(allTypes);
    return allTypes;
  }
  async getLabSections(labId) {
    const allSectionsWithThisCompanyId = await this.sectionModel
      .find({
        companyId: labId,
      })
      .populate('persons')
      .exec();
    return allSectionsWithThisCompanyId;
  }
  async getLabPersons(id) {
    return await this.personService.findByCompanyId(id);
  }

  async readCompany(key, val) {
    try {
      return await this.companyModel.findOne({ [key]: val });
    } catch (err) {
      return null;
    }
  }
  async updateCompany(id: ObjectId, set): Promise<Company> {
    const updatedCompany = await this.companyModel.findOneAndUpdate(
      { _id: id },
      set,
      { new: true },
    );
    return updatedCompany;
  }
  async delCompany(id: string) {
    const deletedPerson = await this.companyModel.findByIdAndRemove(id);
    return deletedPerson;
  }

  async delCompanies(listOfIds: string[]) {
    return this.companyModel.deleteMany({ _id: { $in: listOfIds } });
  }

  async godSearch(
    limit: number,
    page: number,
    entityName?: CompanyEntityName,
    filters?: any,
    sortBy?: object,
  ) {
    function loopAndMakeConditionArray(loopArray) {
      const totalConditions = [];
      loopArray.forEach((keyVal) => {
        const newCondition = {};
        const key = keyVal[0];
        const val = keyVal[1];
        const operator = keyVal[2];
        if (operator == '=') newCondition[key] = val;
        else if (operator == '!=') newCondition[key] = { $ne: val };
        else if (operator == '<') newCondition[key] = { $lt: Number(val) };
        else if (operator == '>') newCondition[key] = { $gt: Number(val) };
        else if (operator == '~') {
          const condRegex = new RegExp(val, 'i');
          newCondition[key] = condRegex;
        }
        totalConditions.push(newCondition);
      });
      return totalConditions;
    }
    // decide about match expression:
    const matchExpression = { isTemp: false };
    if (entityName) {
      matchExpression['companyEntityName'] = entityName;
    }
    // decide about filters and add them to match expression:
    let filtersAndExpression = [];
    let filtersOrExpression = [];
    if (filters) {
      if (filters.ands) {
        filtersAndExpression = loopAndMakeConditionArray(filters.ands);
        Object.assign(matchExpression, { $and: filtersAndExpression });
      }
      if (filters.ors) {
        filtersOrExpression = loopAndMakeConditionArray(filters.ors);
        Object.assign(matchExpression, { $or: filtersOrExpression });
      }
    }
    // decide about sort:
    const sortExpression = { _id: -1 };
    if (sortBy) {
      for (const sortByItemKey in sortBy) {
        const sortByField = sortByItemKey;
        const sortByMethod = sortBy[sortByItemKey] == 'asc' ? 1 : -1;
        sortExpression[sortByField] = sortByMethod;
      }
    }
    let aggregationResults;
    if (Object.keys(sortExpression).length != 0) {
    }
    if (entityName === CompanyEntityName.ORGANIZATION) {
      aggregationResults = await this.companyModel
        .aggregate()
        .match(matchExpression)
        .sort(sortExpression)
        .facet({
          paginatedResults: [
            {
              $skip: limit * (page - 1),
            },
            {
              $limit: limit,
            },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        });
    } else {
      aggregationResults = await this.companyModel
        .aggregate()
        .match(matchExpression)
        .sort(sortExpression)
        .facet({
          paginatedResults: [
            {
              $skip: limit * (page - 1),
            },
            {
              $limit: limit,
            },
            {
              $lookup: {
                from: 'persons',
                localField: 'founderPersonId',
                foreignField: '_id',
                as: 'founderPerson',
              },
            },
            {
              $unwind: {
                path: '$founderPerson',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'persons',
                localField: 'technicalPersonId',
                foreignField: '_id',
                as: 'technicalPerson',
              },
            },
            {
              $unwind: {
                path: '$technicalPerson',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        });
    }

    return aggregationResults;
  }
}
