import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Admission } from '../model/admission.model';
import { Doctor } from '../model/doctor.model';
import { Person3Service } from '../../person3/person3.service';
import { Service } from '../model/service.model';
import { Test } from '../../test/model/test.model';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { PriceList } from '../model/priceList.model';
import { LabTypeEnum } from '../enum/labType.enum';

export interface List {
  count: number;
  admissions: Partial<Admission>[];
}

@Injectable()
export class AdmissionService {
  constructor(
    @InjectModel('admissions')
    private readonly admissionModel: Model<Admission>,
    private httpService: HttpService,
    private personService: Person3Service,
    @InjectModel('doctors')
    private readonly doctorModel: Model<Doctor>,
    @InjectModel('tests')
    private readonly testModel: Model<Test>,
    @InjectModel('services')
    private readonly serviceModel: Model<Service>,
    @InjectModel('priceLists')
    private readonly priceListModel: Model<PriceList>,
  ) {}

  async create(body) {
    delete body._id;
    const date = new Date();

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const admissionCount = await this.admissionModel
      .find({
        createdAt: {
          $gte: firstDayOfMonth,
          $lt: new Date(),
        },
      })
      .countDocuments();
    body.code = await this.generateCode(admissionCount);

    const newEntity = new this.admissionModel(body);
    await newEntity.save();

    return newEntity;
  }

  async generateCode(admissionCount) {
    const date_ob = new Date();

    // current month
    const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    const year = date_ob.getFullYear();

    const Base25 = (function () {
      const ALPHA = '0123456789ACDEFGHKMNPRTWXY';

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const Base25 = function () {};

      const _encode = function (value) {
        if (typeof value !== 'number') {
          throw 'Value is not number!';
        }

        let result = '',
          mod;
        do {
          mod = value % 25;
          result = ALPHA.charAt(mod) + result;
          value = Math.floor(value / 25);
        } while (value > 0);

        return result;
      };

      const _decode = function (value) {
        let result = 0;
        for (let i = 0, len = value.length; i < len; i++) {
          result *= 25;
          result += ALPHA.indexOf(value[i]);
        }

        return result;
      };

      Base25.prototype = {
        constructor: Base25,
        encode: _encode,
        decode: _decode,
      };

      return Base25;
    })();
    const base25 = new Base25();

    const result = year + month + base25.encode(admissionCount);

    const existAdmission = await this.admissionModel.findOne({ code: result });
    if (existAdmission) {
      return this.generateCode(admissionCount + 1);
    } else {
      return result;
    }
  }

  async read(key, val) {
    try {
      return await this.admissionModel
        .findOne({ [key]: val, isTemp: false })
        .populate('owner')
        .populate('patient')
        .populate('services')
        .populate('serviceDetails.service')
        .populate({
          path: 'testDetails.test',
          populate: {
            path: 'sampleDetails.sample',
          },
        })
        .populate({
          path: 'prescriptions.doctor',
          populate: {
            path: 'expertise',
          },
        })
        .populate('testDetails.methods')
        .exec();
    } catch (err) {
      return null;
    }
  }

  async readAll() {
    try {
      return await this.admissionModel.find({ isTemp: false }).exec();
    } catch (err) {
      return null;
    }
  }

  convertNameAndFamily(term: string): Observable<AxiosResponse<any>> {
    try {
      return this.httpService.get(
        `https://one-api.ir/translate/?token=175178:629dbb82230b73.68957031&action=google&lang=en&q=${encodeURI(
          term,
        )}`,
      );
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  genderOfName(term: string): Observable<AxiosResponse<any>> {
    try {
      return this.httpService.get(
        `https://one-api.ir/dictionary/?token=175178:629dbb82230b73.68957031&action=names&q=${encodeURI(
          term,
        )}`,
      );
    } catch (err) {
      return null;
    }
  }

  async update(id: ObjectId, set): Promise<Admission> {
    try {
      if (set.person) {
        if (!set?.person?._id) {
          const newPerson = await this.personService.createPerson(set.person);
          set.patient = newPerson._id;
        } else {
          set.patient = set?.person?._id;
          await this.personService.updatePerson(set?.person?._id, set.person);
        }
      }
      if (set.prescriptions && set.prescriptions.length > 0) {
        for (const item of set.prescriptions) {
          const newDoctor = new this.doctorModel({
            name: item.name,
            medicalNumber: item.medicalNumber,
            expertise: item.expertise,
          });
          await newDoctor.save();
          item.doctor = newDoctor._id;
        }
      }
      await this.admissionModel
        .findOneAndUpdate(
          { _id: id },
          { ...set, isTemp: false },
          {
            new: true,
          },
        )
        .exec();
      return await this.admissionModel.findOne({ _id: id }).exec();
    } catch (err) {
      console.log(err);
    }
  }

  async deleteById(id: string) {
    const deleted = await this.admissionModel.findByIdAndRemove(id);
    return deleted;
  }

  async deleteEntities(listOfIds: string[]) {
    return this.admissionModel.deleteMany({ _id: { $in: listOfIds } });
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
    const matchExpression = { isTemp: false };
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
    const aggregationResults = await this.admissionModel
      .find(matchExpression)
      .sort(sortExpression)
      .skip(limit * (page - 1))
      .limit(limit)
      .populate('owner')
      .populate('patient')
      .populate('services')
      .populate('serviceDetails.service')
      .populate({
        path: 'testDetails.test',
        populate: {
          path: 'sampleDetails.sample',
        },
      })
      .populate({
        path: 'prescriptions.doctor',
        populate: {
          path: 'expertise',
        },
      })
      .populate('testDetails.methods')
      .exec();
    const aggregationResultCount = await this.admissionModel
      .find(matchExpression)
      .sort(sortExpression)
      .countDocuments();
    return { list: aggregationResults, count: aggregationResultCount };
  }

  async testAndService(company: string, term: string) {
    const testConditions = {
      $or: [
        { 'name.fullName': new RegExp(term, 'i') },
        { 'name.shortName': new RegExp(term, 'i') },
        { 'coding.alphabetic': new RegExp(term, 'i') },
        { 'coding.numeric': new RegExp(term, 'i') },
      ],
    };
    const serviceConditions = { service: new RegExp(term, 'i') };
    let tests: any = await this.testModel
      .find(testConditions)
      .populate('methods')
      .populate('parent')
      .populate('relatedTests')
      .populate('testSubsets')
      .populate('sampleDetails.sample')
      .exec();
    let services: any = await this.serviceModel
      .find(serviceConditions)
      .populate('currency')
      .exec();
    tests = JSON.parse(JSON.stringify(tests));
    services = JSON.parse(JSON.stringify(services));
    for (const item of tests) {
      item.type = 'test';
      item.testBlocks = [];
      for (const sub of item.methods) {
        for (const sample of item.sampleDetails) {
          const priceListExpression: any = {
            startDate: { $lt: new Date().getTime() },
            endDate: { $gt: new Date().getTime() },
          };
          if (company) priceListExpression['company'] = company;
          priceListExpression['priceDetails.$.test'] = item._id;
          priceListExpression['priceDetails.$.method'] = sub?._id;
          priceListExpression['priceDetails.$.sample'] = sample?.sample?._id;
          const priceList = await this.priceListModel
            .findOne(priceListExpression)
            .sort({ _id: 'desc' })
            .exec();
          let price = 1000;
          if (priceList && priceList.priceDetails) {
            for (const priceDetail of priceList.priceDetails) {
              if (
                priceDetail.test === item._id &&
                priceDetail.method === sub._id &&
                priceDetail.sample === sample?.sample?._id
              ) {
                price = priceDetail?.price;
              }
            }
          }
          item.testBlocks.push({
            method: sub,
            sampleDetail: sample,
            price: price,
            isMainSample: sample?.sample?.isMain,
          });
        }
      }
      item.testBlocks = item.testBlocks.sort(
        (a, b) => Number(b.bool) - Number(a.bool),
      );
      const priceListExpression: any = {
        startDate: { $lt: new Date().getTime() },
        endDate: { $gt: new Date().getTime() },
      };
      if (company) priceListExpression['company'] = company;
      priceListExpression['priceDetails.0.test'] = item._id;
      const priceList = await this.priceListModel
        .findOne(priceListExpression)
        .sort({ _id: 'desc' })
        .exec();
      let price = 10000;
      if (priceList && priceList.priceDetails) {
        for (const priceDetail of priceList.priceDetails) {
          if (
            priceDetail.test === item._id &&
            !priceDetail.method &&
            !priceDetail.sample
          ) {
            price = priceDetail?.price;
          }
        }
      }
      item.price = price;
    }
    for (const item of services) {
      item.type = 'service';
      item.price = 10000;
    }
    return [...tests, ...services];
  }
  async importData() {
    const testList = [
      {
        _id: '6294b21b129208e533fdbeaf',
        price: 63140,
      },
      {
        _id: '6294b24f129208e533fdbecb',
        price: 63140,
      },
      {
        _id: '6294b2cc129208e533fdbeec',
        price: 63140,
      },
      {
        _id: '6294b3cc129208e533fdbf16',
        price: 63140,
      },
      {
        _id: '62762348129208e533fd6d91',
        price: 63140,
      },
      {
        _id: '6294b733129208e533fdbfa2',
        price: 63140,
      },
      {
        _id: '6294b76c129208e533fdbfbe',
        price: 63140,
      },
      {
        _id: '6294afa5129208e533fdbe31',
        price: 63140,
      },
      {
        _id: '6294aff5129208e533fdbe5b',
        price: 63140,
      },
      {
        _id: '6283a026129208e533fd7e58',
        price: 63140,
      },
      {
        _id: '6283a1f3129208e533fd7ea0',
        price: 63140,
      },
      {
        _id: '62849419129208e533fd7fb5',
        price: 63140,
      },
      {
        _id: '6283a0af129208e533fd7e70',
        price: 63140,
      },
      {
        _id: '6283a154129208e533fd7e88',
        price: 63140,
      },
      {
        _id: '6294b9f4129208e533fdc12a',
        price: 63140,
      },
      {
        _id: '6294ba1c129208e533fdc146',
        price: 63140,
      },
      {
        _id: '628491bd129208e533fd7f74',
        price: 63140,
      },
      {
        _id: '62849201129208e533fd7f94',
        price: 63140,
      },
      {
        _id: '6294a533129208e533fdbc92',
        price: 63140,
      },
      {
        _id: '629496ca129208e533fdbbd2',
        price: 63140,
      },
      {
        _id: '62949705129208e533fdbbee',
        price: 63140,
      },
      {
        _id: '6294974c129208e533fdbc0a',
        price: 63140,
      },
      {
        _id: '6294a5a0129208e533fdbcae',
        price: 63140,
      },
      {
        _id: '6294a90c129208e533fdbce6',
        price: 63140,
      },
      {
        _id: '6294a959129208e533fdbd02',
        price: 63140,
      },
      {
        _id: '6294a4b2129208e533fdbc5a',
        price: 63140,
      },
      {
        _id: '6294a4f3129208e533fdbc76',
        price: 63140,
      },
      {
        _id: '62945cb0129208e533fdb941',
        price: 63140,
      },
      {
        _id: '62945cea129208e533fdb97e',
        price: 63140,
      },
      {
        _id: '62946566129208e533fdba16',
        price: 63140,
      },
      {
        _id: '62948f5d129208e533fdba86',
        price: 63140,
      },
      {
        _id: '62948f8e129208e533fdbaa2',
        price: 63140,
      },
      {
        _id: '62948fd7129208e533fdbabe',
        price: 63140,
      },
      {
        _id: '629466a5129208e533fdba32',
        price: 63140,
      },
      {
        _id: '629466fa129208e533fdba4e',
        price: 63140,
      },
      {
        _id: '629467c0129208e533fdba6a',
        price: 63140,
      },
      {
        _id: '628490d2129208e533fd7f32',
        price: 63140,
      },
      {
        _id: '62937857129208e533fdb220',
        price: 63140,
      },
      {
        _id: '62937893129208e533fdb23c',
        price: 63140,
      },
      {
        _id: '6294b967129208e533fdc0d6',
        price: 63140,
      },
      {
        _id: '6294b98d129208e533fdc0f2',
        price: 63140,
      },
      {
        _id: '6294af01129208e533fdbdf9',
        price: 63140,
      },
      {
        _id: '6294af4d129208e533fdbe15',
        price: 63140,
      },
      {
        _id: '6294b620129208e533fdbf4e',
        price: 63140,
      },
      {
        _id: '6294b0c3129208e533fdbe77',
        price: 63140,
      },
      {
        _id: '62849031129208e533fd7f11',
        price: 63140,
      },
    ];
    let tests: any = {};
    const testBlocks: any[] = [];

    for (const item of testList) {
      const test = await this.testModel.findById(item._id).exec();
      testBlocks.push({
        test: item?._id,
        price: item.price,
        isActive: true,
      });
      for (const sub of test.methods) {
        for (const sample of test.sampleDetails) {
          testBlocks.push({
            test: item?._id,
            method: sub,
            sample: sample?.sample,
            price: item.price,
            isActive: true,
          });
        }
      }
    }
    tests = {
      name: new Date().getTime(),
      priceDetails: testBlocks,
      startDate: 0,
      endDate: 999999999999999,
      labType: LabTypeEnum.GOVERNMENT,
    };
    return await new this.priceListModel(tests).save();
  }
}
