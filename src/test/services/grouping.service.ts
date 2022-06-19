import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Grouping } from '../model/grouping.model';
import { GroupingType } from '../model/entityName.enum';

export interface List {
  count: number;
  groupings: Partial<Grouping>[];
}

@Injectable()
export class GroupingService {
  constructor(
    @InjectModel('Grouping')
    private readonly groupingModel: Model<Grouping>,
  ) {}

  async create(body) {
    delete body._id;
    const newEntity = new this.groupingModel(body);
    await newEntity.save();
    return newEntity;
  }

  async readAll(type: string): Promise<Grouping[]> {
    const query: any = { type };

    return await this.groupingModel.find(query).populate('parent').exec();
  }

  async read(key, val) {
    try {
      return await this.groupingModel.findOne({ [key]: val });
    } catch (err) {
      return null;
    }
  }

  async update(id: ObjectId, set): Promise<Grouping> {
    const updated = await this.groupingModel.findOneAndUpdate(
      { _id: id },
      set,
      {
        new: true,
      },
    );
    return updated;
  }

  async deleteById(id: string) {
    const deleted = await this.groupingModel.findByIdAndRemove(id);
    return deleted;
  }

  async deleteEntities(listOfIds: string[]) {
    return this.groupingModel.deleteMany({ _id: { $in: listOfIds } });
  }

  async godSearch(
    limit: number,
    page: number,
    type?: GroupingType,
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
    const matchExpression = {};
    if (type) {
      matchExpression['type'] = type;
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
    const sortExpression = { _id: -1};
    if (sortBy) {
      for (const sortByItemKey in sortBy) {
        const sortByField = sortByItemKey;
        const sortByGrouping = sortBy[sortByItemKey] == 'asc' ? 1 : -1;
        sortExpression[sortByField] = sortByGrouping;
      }
    }
    if (Object.keys(sortExpression).length != 0) {
    }
    const aggregationResults = await this.groupingModel
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
