import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { PriceList } from '../model/priceList.model';

export interface List {
  count: number;
  priceLists: Partial<PriceList>[];
}

@Injectable()
export class PriceListService {
  constructor(
    @InjectModel('priceLists')
    private readonly priceListModel: Model<PriceList>,
  ) {}

  async create(body) {
    delete body._id;
    const newEntity = new this.priceListModel(body);
    await newEntity.save();
    return newEntity;
  }

  async read(key, val) {
    try {
      return await this.priceListModel
        .findOne({ [key]: val })
        .populate('priceDetails.test')
        .populate('priceDetails.method')
        .populate('priceDetails.sample')
        .populate('priceDetails.service')
        .populate('currency')
        .populate('company');
    } catch (err) {
      return null;
    }
  }
  async readAll(): Promise<PriceList[]> {
    return await this.priceListModel
      .find()
      .populate('priceDetails.test')
      .populate('priceDetails.method')
      .populate('priceDetails.sample')
      .populate('priceDetails.service')
      .populate('currency')
      .populate('company')
      .exec();
  }

  async update(id: ObjectId, set): Promise<PriceList> {
    const updated = await this.priceListModel.findOneAndUpdate(
      { _id: id },
      set,
      {
        new: true,
      },
    );
    return updated;
  }

  async deleteById(id: string) {
    const deleted = await this.priceListModel.findByIdAndRemove(id);
    return deleted;
  }

  async deleteEntities(listOfIds: string[]) {
    return this.priceListModel.deleteMany({ _id: { $in: listOfIds } });
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
    const aggregationResults = await this.priceListModel
      .find(matchExpression)
      .sort(sortExpression)
      .skip(limit * (page - 1))
      .limit(limit)
      .populate('priceDetails.test')
      .populate('priceDetails.method')
      .populate('priceDetails.sample')
      .populate('priceDetails.service')
      .populate('currency')
      .populate('company');
    const aggregationResultCount = await this.priceListModel
      .find(matchExpression)
      .sort(sortExpression)
      .countDocuments();
    return { list: aggregationResults, count: aggregationResultCount };
  }
}
