import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Sample } from '../model/sample.model';

export interface List {
  count: number;
  companies: Partial<Sample>[];
}

@Injectable()
export class SampleService {
  constructor(
    @InjectModel('Sample') private readonly sampleModel: Model<Sample>,
  ) {}

  async create(body) {
    delete body._id;
    const newEntity = new this.sampleModel(body);
    await newEntity.save();
    return await this.sampleModel
      .findOne({ _id: newEntity._id })
      .populate({
        path: 'containers',
        populate: {
          path: 'group',
        },
      })
      .populate('group')
      .exec();
  }
  async readAll(): Promise<Sample[]> {
    return await this.sampleModel.find().exec();
  }

  async read(key, val) {
    try {
      return await this.sampleModel
        .findOne({ [key]: val })
        .populate({
          path: 'containers',
          populate: {
            path: 'group',
          },
        })
        .populate('group')
        .exec();
    } catch (err) {
      return null;
    }
  }

  async update(id: ObjectId, set): Promise<Sample> {
    await this.sampleModel.findOneAndUpdate({ _id: id }, set, {
      new: true,
    });
    return await this.sampleModel
      .findOne({ _id: id })
      .populate({
        path: 'containers',
        populate: {
          path: 'group',
        },
      })
      .populate('group')
      .exec();
  }

  async deleteById(id: string) {
    const deleted = await this.sampleModel.findByIdAndRemove(id);
    return deleted;
  }

  async deleteEntities(listOfIds: string[]) {
    return this.sampleModel.deleteMany({ _id: { $in: listOfIds } });
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
    const sortExpression = { createdAt: -1 };
    if (sortBy) {
      for (const sortByItemKey in sortBy) {
        const sortByField = sortByItemKey;
        const sortBySample = sortBy[sortByItemKey] == 'asc' ? 1 : -1;
        sortExpression[sortByField] = sortBySample;
      }
    }
    if (Object.keys(sortExpression).length != 0) {
    }
    const aggregationResults = await this.sampleModel
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
              from: 'groupings',
              localField: 'group',
              foreignField: '_id',
              as: 'groupDetail',
            },
          },
          {
            $unwind: { path: '$groupDetail', preserveNullAndEmptyArrays: true },
          },
          {
            $lookup: {
              from: 'containers',
              localField: 'containers',
              foreignField: '_id',
              as: 'containers',
            },
          },
          {
            $unwind: { path: '$containers', preserveNullAndEmptyArrays: true },
          },
          {
            $lookup: {
              from: 'groupings',
              localField: 'containers.group',
              foreignField: '_id',
              as: 'containers.group',
            },
          },
          {
            $group: {
              _id: '$_id',
              name: { $first: '$name' },
              isActive: { $first: '$isActive' },
              groupDetail: { $first: '$groupDetail' },
              groupName: { $first: '$groupName' },
              containers: {
                $push: {
                  _id: '$containers._id',
                  name: '$containers.name',
                  group: '$containers.group',
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
    return aggregationResults;
  }
}
