import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Test } from '../model/test.model';

export interface List {
  count: number;
  companies: Partial<Test>[];
}

@Injectable()
export class TestService {
  constructor(@InjectModel('Test') private readonly testModel: Model<Test>) {}

  async create(body) {
    delete body._id;
    const newEntity = new this.testModel(body);
    await newEntity.save();

    return await this.testModel
      .findOne({ _id: newEntity._id })
      .populate('methods')
      .populate('parent')
      .populate('testSubsets')
      .populate('relatedTests')
      .populate({
        path: 'sampleDetails.sample',
        populate: [
          {
            path: 'containers',
          },
          {
            path: 'group',
          },
        ],
      })
      .exec();
  }

  async read(key, val) {
    try {
      return await this.testModel
        .findOne({ [key]: val })
        .populate('methods')
        .populate('parent')
        .populate('relatedTests')
        .populate('testSubsets')
        .populate('sampleDetails.sample')
        .exec();
    } catch (err) {
      return null;
    }
  }
  async readAll() {
    try {
      return await this.testModel
        .find()
        .populate('methods')
        .populate('testSubsets')
        .populate('parent')
        .populate('relatedTests')
        .populate('sampleDetails.sample')
        .exec();
    } catch (err) {
      return null;
    }
  }

  async update(id: ObjectId, set): Promise<Test> {
    await this.testModel.findOneAndUpdate({ _id: id }, set, {
      new: true,
    });
    return await this.testModel
      .findOne({ _id: id })
      .populate('methods')
      .populate('testSubsets')
      .populate('parent')
      .populate('relatedTests')
      .populate('sampleDetails.sample')
      .exec();
  }

  async deleteById(id: string) {
    const deleted = await this.testModel.findByIdAndRemove(id);
    return deleted;
  }

  async deleteEntities(listOfIds: string[]) {
    return this.testModel.deleteMany({ _id: { $in: listOfIds } });
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
    const aggregationResults = await this.testModel
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
              from: 'methods',
              localField: 'methods',
              foreignField: '_id',
              as: 'methods',
            },
          },
          { $unwind: '$sampleDetails' },
          {
            $lookup: {
              from: 'samples',
              localField: 'sampleDetails.sample',
              foreignField: '_id',
              as: 'sampleDetails.sample',
            },
          },
          {
            $unwind: '$sampleDetails.sample',
          },
          {
            $group: {
              _id: '$_id',
              moreInfo: { $first: '$moreInfo' },
              limitations: { $first: '$limitations' },
              name: { $first: '$name' },
              coding: { $first: '$coding' },
              isActive: { $first: '$isActive' },
              isMandatory: { $first: '$isMandatory' },
              scientificGrouping: { $first: '$scientificGrouping' },
              isOrderable: { $first: '$isOrderable' },
              conditions: { $first: '$conditions' },
              methods: { $first: '$methods' },
              sampleDetails: {
                $push: {
                  sample: '$sampleDetails.sample',
                  isMain: '$sampleDetails.isMain',
                  conditions: '$sampleDetails.conditions',
                  location: '$sampleDetails.location',
                },
              },
            },
          },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
    if(aggregationResults && aggregationResults[0].paginatedResults){
      for(let item of aggregationResults[0].paginatedResults){
        item.price = 10000;
        for(let sub of item.methods){
          sub.price=1000
        }
      }
    }
    return aggregationResults;
  }
}
