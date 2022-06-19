import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Country } from '../model/country.model';

export interface List {
  count: number;
  countries: Partial<Country>[];
}

@Injectable()
export class CountryService {
  constructor(
    @InjectModel('Country') private readonly countryModel: Model<Country>,
  ) {}

  async create(body) {
    delete body._id;
    const newEntity = new this.countryModel(body);
    await newEntity.save();
    return newEntity;
  }

  async read(key, val) {
    try {
      return await this.countryModel.findOne({ [key]: val });
    } catch (err) {
      return null;
    }
  }
  async readAll(): Promise<Country[]> {
    return await this.countryModel.find().exec();
  }

  async update(id: ObjectId, set): Promise<Country> {
    const updated = await this.countryModel.findOneAndUpdate({ _id: id }, set, {
      new: true,
    });
    return updated;
  }

  async deleteById(id: string) {
    const deleted = await this.countryModel.findByIdAndRemove(id);
    return deleted;
  }

  async deleteEntities(listOfIds: string[]) {
    return this.countryModel.deleteMany({ _id: { $in: listOfIds } });
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
    const sortExpression = { _id: -1 };
    if (sortBy) {
      for (const sortByItemKey in sortBy) {
        const sortByField = sortByItemKey;
        const sortByMethod = sortBy[sortByItemKey] == 'asc' ? 1 : -1;
        sortExpression[sortByField] = sortByMethod;
      }
    }
    if (Object.keys(sortExpression).length != 0) {
    }
    const aggregationResults = await this.countryModel
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
