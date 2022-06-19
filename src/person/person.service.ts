import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person } from './model/person.model';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
var forEach = require('async-foreach').forEach;

@Injectable()
export class PersonService {
    constructor (
        @InjectModel('Person') private readonly personModel: Model<Person>,
        private httpService: HttpService
    ) {}
    async createPerson (body) {
        const newPerson = new this.personModel(body)
        await newPerson.save();
        return newPerson;
    }
    async readPerson (key, val) {
        try {
            return await this.personModel.findOne({ [key]: val });
        } catch (err) {
            return null;
        }
    }
    async list (limit, key, val, page = false) { //#TODO add key validations 
        if (!page) { // list mode
            let persons;
            try {
                if (limit == 'all') {
                    persons = await this.personModel.find({[key]:val});
                    console.log(persons);
                } else if (limit == 'count') {
                    persons = [ 
                        {
                            count: await this.personModel.count({[key]:val}) 
                        }
                    ];
                } else if (limit == 'all&count') {
                    persons = [ 
                        {
                            count: await this.personModel.count({[key]:val}) 
                        },
                        {
                            persons: await this.personModel.find({[key]:val})
                        }
                    ];
                } else {
                    persons = await this.personModel.find({[key]:val}).limit(Number(limit));
                }
                return persons;
            } catch (err) {
                return null;
            }
        } else if (page) {
            let users;
            if (Number(page) == 1) {
                try {
                    users = await this.personModel.find({[key]:val}).limit(Number(limit));
                } catch (err) {
                    users = null;
                }
            } else {
                try {
                    users = await this.personModel.find({[key]:val}).skip((Number(page) - 1) * limit).limit(Number(limit))
                } catch (err) {
                    users = null;
                }
            }
            return users;
        }
    }
    async getAllll (thisPersonGroupValue, key, val, done, groupedPersons, personnnModel, groupingKeyy) {
        let person = await personnnModel.find({[key]:val, [groupingKeyy]: thisPersonGroupValue});;
        groupedPersons[thisPersonGroupValue] = person;
        done();
    }
    async list4Grouping (limit, key, val, groupingKey, page = false) { 
        const allPersons = await this.personModel.find({[key]:val});
        let groupedPersons = {};
        const getAl = this.getAllll;
        const personnnModel = this.personModel;
        let myPromise = new Promise(function(myResolve, myReject) {
            // "Producing Code" (May take some time)
            forEach(allPersons, function (person) {
                var done = this.async();
                let thisPersonGroupValue = person[groupingKey] // gholi
                getAl(thisPersonGroupValue, key, val, done, groupedPersons, personnnModel, groupingKey);
            },() => {
                myResolve(groupedPersons);
            });
        });
        return await myPromise;
        
        // if (!page) { // list mode
        //     let persons;
        //     try {
        //         if (limit == 'all') {
        //             persons = await this.personModel.find({[key]:val,[groupingKey]: groupingVal});
        //             console.log(persons);
        //         } else if (limit == 'count') {
        //             persons = [ 
        //                 {
        //                     count: await this.personModel.count({[key]:val,[groupingKey]: groupingVal}) 
        //                 }
        //             ];
        //         } else if (limit == 'all&count') {
        //             persons = [ 
        //                 {
        //                     count: await this.personModel.count({[key]:val,[groupingKey]: groupingVal}) 
        //                 },
        //                 {
        //                     persons: await this.personModel.find({[key]:val,[groupingKey]: groupingVal})
        //                 }
        //             ];
        //         } else {
        //             persons = await this.personModel.find({[key]:val,[groupingKey]: groupingVal}).limit(Number(limit));
        //         }
        //         return persons;
        //     } catch (err) {
        //         return null;
        //     }
        // } else if (page) { // pagination mode: #TODO: skip or criterian!
        //     let users;
        //     if (Number(page) == 1) {
        //         try {
        //             users = await this.personModel.find({[key]:val,[groupingKey]: groupingVal}).limit(Number(limit));
        //         } catch (err) {
        //             users = null;
        //         }
        //     } else {
        //         try {
        //             users = await this.personModel.find({[key]:val,[groupingKey]: groupingVal}).skip((Number(page) - 1) * limit).limit(Number(limit))
        //         } catch (err) {
        //             users = null;
        //         }
        //     }
        //     return users;
        // }
    }
    async updatePerson (whereKey, whereVal, set) { // just updates one person
        let updatedUser = await this.personModel.findOneAndUpdate({[whereKey]: whereVal}, set, {new: true});
        if (updatedUser) return await updatedUser.save();
        else return false;
    }
    async delPerson (whereKey, whereVal) {
        return await this.personModel.deleteMany({[whereKey]: whereVal});
    }
    async search (keys, searchText, wherekey, whereval) {
        if (searchText == '') return [];
        // make ors array;
        let ors = [];
        keys.forEach((keyForSearchOrs) => {
            ors.push({
                [keyForSearchOrs]: new RegExp(`(.)*${searchText}(.)*`, 'gim')
            })
        })
        // let ors = [{ name: new RegExp(`(.)*${val}(.)*`, 'gim') }, { family: new RegExp(val, 'gim') }];
        return await this.personModel.find({[wherekey]: whereval}).or(ors);
    }
    async searchWithConds (andKeys, orKeys, wherekey, whereval, limit, page) {
        if (andKeys == undefined) andKeys = [];
        if (orKeys == undefined) orKeys = [];
        
        let error = 'false';
        let errors = [
            'you need to specify an operator'
        ];
        
        let ands = [];
        if (andKeys) {
            andKeys.forEach((keyVal) => {
                let newCondition = {}
                let key = keyVal[0];
                let val = keyVal[1];
                let operator = keyVal[2];
                if (operator == '=') newCondition[key] = val;
                else if (operator == '<') newCondition[key] = { $lt : Number(val) }
                else if (operator == '>') newCondition[key] = { $gt : Number(val) }
                else if (operator == '~') {
                    let condRegex = new RegExp(val, "g");
                    newCondition[key] = condRegex;
                }
                else error = errors[0];
                if (error == 'false') {
                    ands.push(newCondition)
                }
            })
        }

        let ors = [];
        if (orKeys) {
            orKeys.forEach((keyVal) => {
                let newCondition = {}
                let key = keyVal[0];
                let val = keyVal[1];
                let operator = keyVal[2];
                if (operator == '=') newCondition[key] = val;
                else if (operator == '<') newCondition[key] = { $lt : Number(val) }
                else if (operator == '>') newCondition[key] = { $gt : Number(val) }
                else if (operator == '~') {
                    let condRegex = new RegExp(val, "g");
                    newCondition[key] = condRegex;
                }
                else error = errors[0];
                if (error == 'false') {
                    ors.push(newCondition)
                }
            })
        }

        let results;
        let count;
        if (error == 'false') {
            // pagination:
            if (Number(page) == 1) {
                if (ands.length == 0 && ors.length == 0) {
                    results = ['you need to specify at least one And or Or condition']
                } else if (ors.length == 0) {
                    results = await this.personModel.find({[wherekey]: whereval}).and(ands).limit(Number(limit));
                    count = await this.personModel.count({[wherekey]: whereval}).and(ands);
                } else if (ands.length == 0) {
                    results = await this.personModel.find({[wherekey]: whereval}).or(ors).limit(Number(limit));
                    count = await this.personModel.count({[wherekey]: whereval}).or(ors);
                } else {
                    results = await this.personModel.find({[wherekey]: whereval}).and(ands).or(ors).limit(Number(limit));
                    count = await this.personModel.count({[wherekey]: whereval}).and(ands).or(ors);
                }
            } else {
                if (ands.length == 0 && ors.length == 0) {
                    results = ['you need to specify at least one And or Or condition']
                } else if (ors.length == 0) {
                    results = await this.personModel.find({[wherekey]: whereval}).and(ands).skip((Number(page) - 1) * limit).limit(Number(limit));
                    count = await this.personModel.count({[wherekey]: whereval}).and(ands);
                } else if (ands.length == 0) {
                    results = await this.personModel.find({[wherekey]: whereval}).or(ors).skip((Number(page) - 1) * limit).limit(Number(limit));
                    count = await this.personModel.count({[wherekey]: whereval}).or(ors);
                } else {
                    results = await this.personModel.find({[wherekey]: whereval}).and(ands).or(ors).skip((Number(page) - 1) * limit).limit(Number(limit));
                    count = await this.personModel.count({[wherekey]: whereval}).and(ands);
                }
            }

        } else {
            results = [error];
        }
        const searchList = {
            results,
            count
        }
        return searchList;
    }
    getCountries (): Observable<AxiosResponse<object>> {
        return this.httpService
          .get(`https://api.first.org/data/v1/countries`)
          .pipe(
             map((axiosResponse: AxiosResponse) => {
               return axiosResponse.data;
             }),
          );
    }
    getCities (country): Observable<AxiosResponse<object>> {
        return this.httpService
          .post(`https://countriesnow.space/api/v0.1/countries/cities`, { "country": country })
          .pipe(
             map((axiosResponse: AxiosResponse) => {
                return axiosResponse.data;
             }),
          );
    }
}
