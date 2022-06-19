import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expertise, ExpertiseDocument } from './model/expertise.schema';

@Injectable()
export class ExpertiseService {
  constructor(
    @InjectModel('Expertise') private ExpertiseModel: Model<ExpertiseDocument>,
  ) {}

  async create(expertise: Expertise): Promise<Expertise> {
    const newExpertise = new this.ExpertiseModel(expertise);
    return newExpertise.save();
  }

  async readAll(): Promise<Expertise[]> {
    return await this.ExpertiseModel.find().sort({ _id: -1 }).exec();
  }

  async readById(id: string): Promise<Expertise> {
    return await this.ExpertiseModel.findById(id).exec();
  }

  async update(id: string, expertise: Expertise): Promise<Expertise> {
    return await this.ExpertiseModel.findByIdAndUpdate(id, expertise, {
      new: true,
    });
  }

  async delete(id: string): Promise<any> {
    return await this.ExpertiseModel.findByIdAndRemove(id);
  }
  async deleteById(id: string) {
    const deleted = await this.ExpertiseModel.findByIdAndRemove(id);
    return deleted;
  }
  async delExpertises(listOfIds: string[]) {
    return this.ExpertiseModel.deleteMany({ _id: { $in: listOfIds } });
  }

  async godSearch(limit: number, page: number, filters?: any, sortBy?: object) {
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
    const matchExpression = {};
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
    const sortExpression = { _id: -1};
    if (sortBy) {
      for (const sortByItemKey in sortBy) {
        const sortByField = sortByItemKey;
        const sortByMethod = sortBy[sortByItemKey] == 'asc' ? 1 : -1;
        sortExpression[sortByField] = sortByMethod;
      }
    }
    if (Object.keys(sortExpression).length != 0) {
    }
    const aggregationResults = await this.ExpertiseModel
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
    return aggregationResults;
  }
}
