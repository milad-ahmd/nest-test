import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Person3 } from './model/person3.model';
import { EntityName } from './model/entityName.enum';
import { ExpertiseService } from './expertise.service';
import { StatesSchemaType, StatesSchemaClass } from './model/states.schema';
import { CompanyEntityName } from '../company/model/entityName.enum';

const forEach = require('async-foreach').forEach;
const csv = require('csvtojson');

export interface List {
  count: number;
  persons: Partial<Person3>[];
}

// export interface GroupedPersons {
//     [key: string]: Partial<Person3>[];
// }
@Injectable()
export class Person3Service {
  constructor(
    @InjectModel('Person3') private readonly personModel: Model<Person3>,
    @InjectModel('States') private statesModel: Model<StatesSchemaType>,
    private expertiseService: ExpertiseService,
  ) {}

  async findBySectionID(id) {
    const answer = await this.personModel.find({ sectionId: id });
    return answer;
  }

  async findByCompanyId(id) {
    const answer = await this.personModel.find({ companyId: id });
    return answer;
  }

  async createPerson(body): Promise<Person3> {
    if (body['expertiseId']) {
      const expertiseId = body['expertiseId'];
      const expertise = await this.expertiseService.readById(expertiseId);
      const expertiseName = expertise['name'];
      body['expertiseName'] = expertiseName;
    }
    let newPerson = new this.personModel(body);
    newPerson = await newPerson.save();
    return await this.personModel
      .findOne({ _id: newPerson._id })
      .populate('companyId');
  }

  async readPerson(key, val): Promise<Person3 | null> {
    try {
      return await this.personModel
        .findOne({ [key]: val })
        .populate('companyId');
    } catch (err) {
      return null;
    }
  }

  async list(
    limit: number,
    page: number,
    entityName: EntityName,
    groupingKey?: string,
    groupingVal?: string,
  ): Promise<List> {
    let users: Person3[];
    let count: number;
    if (groupingKey && groupingVal) {
      count = await this.personModel.count({
        entityName,
        [groupingKey]: groupingVal,
      });
      if (page == 1)
        users = await this.personModel
          .find({ entityName, [groupingKey]: groupingVal })
          .limit(Number(limit));
      else
        users = await this.personModel
          .find({ entityName, [groupingKey]: groupingVal })
          .skip((Number(page) - 1) * limit)
          .limit(Number(limit));
    } else {
      count = await this.personModel.count({ entityName });
      if (page == 1)
        users = await this.personModel
          .find({ entityName })
          .limit(Number(limit));
      else
        users = await this.personModel
          .find({ entityName })
          .skip((Number(page) - 1) * limit)
          .limit(Number(limit));
    }
    const list: List = {
      count: count,
      persons: users,
    };
    return list;
  }

  async groupList(entityName: EntityName, groupingKey: string, limit, page) {
    return await this.personModel.aggregate([
      {
        $match: { entityName },
      },
      {
        $skip: limit * (page - 1),
      },
      {
        $limit: limit,
      },
      {
        $group: {
          _id: `$${groupingKey}`,
          persons: {
            $push: '$$ROOT',
          },
        },
      },
    ]);
  }

  async godSearch(
    limit: number,
    page: number,
    entityName?: EntityName,
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
    if (entityName) {
      matchExpression['entityName'] = entityName;
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
    const aggregationResults = await this.personModel
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
              from: 'companies',
              localField: 'companyId',
              foreignField: '_id',
              as: 'company',
            },
          },
          {
            $unwind: {
              path: '$company',
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
    return aggregationResults;
  }

  async updatePerson(id: ObjectId, set): Promise<Person3> {
    // just updates one person
    if (set['expertiseId']) {
      const expertiseId = set['expertiseId'];
      const expertise = await this.expertiseService.readById(expertiseId);
      const expertiseName = expertise['name'];
      set['expertiseName'] = expertiseName;
    }
    const userToUpdate = await this.personModel.findOneAndUpdate(
      { _id: id },
      set,
      { new: true },
    );
    return await this.personModel
      .findOne({ _id: id })
      .populate('companyId');
  }

  async delPerson(id: string): Promise<Partial<Person3> | null> {
    const deletedPerson = await this.personModel.findByIdAndRemove(id);
    return deletedPerson;
  }

  async delPerson2(id: ObjectId, deltedPersons, done, psnModel) {
    const deletedPerson = await psnModel.findByIdAndRemove(id);
    deltedPersons.push(deletedPerson);
    done();
  }

  async delPersons(listOfIds: string[]) {
    const deletedPersons = [];
    // await this.personModel.findByIdAndRemove(idToDel);

    const delperson = this.delPerson2;
    const psnModel = this.personModel;
    const myPromise = new Promise(function (myResolve, myReject) {
      // "Producing Code" (May take some time)
      forEach(
        listOfIds,
        function (idToDel) {
          const done = this.async();
          delperson(idToDel, deletedPersons, done, psnModel);
        },
        () => {
          myResolve(deletedPersons);
        },
      );
    });
    return await myPromise;
  }

  async search(
    keys: string[],
    searchText: string,
    entityName?: EntityName,
  ): Promise<List> {
    if (searchText == '')
      return {
        persons: [],
        count: 0,
      };
    // make ors array;
    const ors = [];
    keys.forEach((keyForSearchOrs) => {
      ors.push({
        [keyForSearchOrs]: new RegExp(searchText, 'gim'),
      });
    });
    // let ors = [{ name: new RegExp(`(.)*${val}(.)*`, 'gim') }, { family: new RegExp(val, 'gim') }];
    let persons: Partial<Person3>[];
    if (entityName) {
      persons = await this.personModel.find({ entityName }).or(ors);
    } else {
      persons = await this.personModel.find().or(ors);
    }
    const count = persons.length;
    const resultsList: List = {
      persons,
      count,
    };
    return resultsList;
  }

  async searchWithConds(
    andKeys: string[],
    orKeys: string[],
    entityName: string,
    limit: number,
    page: number,
  ): Promise<List> {
    let wherekey: string;
    let whereval: string;
    if (entityName != undefined) {
      wherekey = 'entityName';
      whereval = entityName;
    }
    if (andKeys == undefined) andKeys = [];
    if (orKeys == undefined) orKeys = [];

    let error = 'false';
    const errors = ['you need to specify an operator'];

    const ands = [];
    if (andKeys) {
      andKeys.forEach((keyVal) => {
        const newCondition = {};
        const key = keyVal[0];
        const val = keyVal[1];
        const operator = keyVal[2];
        if (operator == '=') newCondition[key] = val;
        else if (operator == '<') newCondition[key] = { $lt: Number(val) };
        else if (operator == '>') newCondition[key] = { $gt: Number(val) };
        else if (operator == '~') {
          const condRegex = new RegExp(val, 'i');
          newCondition[key] = condRegex;
        } else error = errors[0];
        if (error == 'false') {
          ands.push(newCondition);
        }
      });
    }

    const ors = [];
    if (orKeys) {
      orKeys.forEach((keyVal) => {
        const newCondition = {};
        const key = keyVal[0];
        const val = keyVal[1];
        const operator = keyVal[2];
        if (operator == '=') newCondition[key] = val;
        else if (operator == '<') newCondition[key] = { $lt: Number(val) };
        else if (operator == '>') newCondition[key] = { $gt: Number(val) };
        else if (operator == '~') {
          const condRegex = new RegExp(val, 'i');
          newCondition[key] = condRegex;
        } else error = errors[0];
        if (error == 'false') {
          ors.push(newCondition);
        }
      });
    }

    let results;
    let count;
    if (error == 'false') {
      // pagination:
      if (Number(page) == 1) {
        if (ands.length == 0 && ors.length == 0) {
          results = ['you need to specify at least one And or Or condition'];
        } else if (ors.length == 0) {
          results = await this.personModel
            .find({ [wherekey]: whereval })
            .and(ands)
            .limit(Number(limit));
          count = await this.personModel
            .count({ [wherekey]: whereval })
            .and(ands);
        } else if (ands.length == 0) {
          results = await this.personModel
            .find({ [wherekey]: whereval })
            .or(ors)
            .limit(Number(limit));
          count = await this.personModel
            .count({ [wherekey]: whereval })
            .or(ors);
        } else {
          results = await this.personModel
            .find({ [wherekey]: whereval })
            .and(ands)
            .or(ors)
            .limit(Number(limit));
          count = await this.personModel
            .count({ [wherekey]: whereval })
            .and(ands)
            .or(ors);
        }
      } else {
        if (ands.length == 0 && ors.length == 0) {
          results = ['you need to specify at least one And or Or condition'];
        } else if (ors.length == 0) {
          results = await this.personModel
            .find({ [wherekey]: whereval })
            .and(ands)
            .skip((Number(page) - 1) * limit)
            .limit(Number(limit));
          count = await this.personModel
            .count({ [wherekey]: whereval })
            .and(ands);
        } else if (ands.length == 0) {
          results = await this.personModel
            .find({ [wherekey]: whereval })
            .or(ors)
            .skip((Number(page) - 1) * limit)
            .limit(Number(limit));
          count = await this.personModel
            .count({ [wherekey]: whereval })
            .or(ors);
        } else {
          results = await this.personModel
            .find({ [wherekey]: whereval })
            .and(ands)
            .or(ors)
            .skip((Number(page) - 1) * limit)
            .limit(Number(limit));
          count = await this.personModel
            .count({ [wherekey]: whereval })
            .and(ands);
        }
      }
    } else {
      results = [error];
    }
    const searchList: List = {
      persons: results,
      count,
    };
    return searchList;
  }

  async createStates() {
    const csvPath = __dirname + '/../../docs/DimGeographicInfo.csv';
    const jsonedIranStates = await csv().fromFile(csvPath);
    await this.statesModel.remove({});
    await this.statesModel.insertMany(jsonedIranStates);
  }

  async getStates() {
    return await this.statesModel.distinct('StateFars');
  }

  async getCities(StateFars: string) {
    return await this.statesModel.find({ StateFars: StateFars });
  }
}
