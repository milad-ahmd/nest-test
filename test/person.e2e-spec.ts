import {
  Test,
  TestingModule
} from '@nestjs/testing';
import {
  INestApplication
} from '@nestjs/common';
import * as request from 'supertest';
import {
  PersonModule
} from '../src/person/person.module';
import {
  Person3Module
} from '../src/person3/person3.module';
import {
  MongooseModule
} from '@nestjs/mongoose';
import {
  ValidationPipe
} from '@nestjs/common';
import {
  connections
} from 'mongoose';
describe('Person (e2e)', () => {
  let app: INestApplication;
  let mongodbAddress = "mongodb://127.0.0.1:27017";
  let newUserId: String;
  let usersToBeDeleted: String[] = [];
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        Person3Module,
        MongooseModule.forRoot(`${mongodbAddress}/colife`)
      ],
      providers: []
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    )
    await app.init();
  });
  afterEach((done) => {
    connections[1].close(() => {
      done();
    });
    app.close();
  })

  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Colife_APIs_tests_results ', () => { expect(true) });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ createPerson API ', () => { expect(true) });
  it('test 001-createPerson: ►valid request◄ create a valid person, expected a CREATED 201 http message status code', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "ali",
        "family": "gholi",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": 32432432
      })
      .expect(201)
      .then((res) => {
        newUserId = res.body._id;
        expect(res.body.status).toBeDefined();
      })
  });
  it('test 002-createPerson: ►server detects not expected params provided◄ , expected a PRECONDITION_FAILED 412 error', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "NEW",
        "family": "invalid person, not enough params provided",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435
      })
      .expect(412);
  });
  it('test 003-createPerson: ►incorrect params types◄, expected a BAD_REQUEST 400 error', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "NEW",
        "family": "invalid person, not enough params provided",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": "32432432"
      })
      .expect(400);
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ readPerson API ', () => { expect(true) });
  it('test 004-readPerson: ►valid request◄ read a valid user with _id, expected 200 http message status code', () => {
    return request(app.getHttpServer())
      .get(`/person3/_id/${newUserId}`)
      .expect(200)
      .then((res) => {
        expect(res.body.status).toBeDefined();
      })
  });
  it('test 005-readPersons: ►server detects not expected params provided◄ read a valid user with invalid key,e.g. with name,expected PRECONDITION_FAILED 412', () => {
    return request(app.getHttpServer())
      .get(`/person3/name/ali`)
      .expect(412);
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ list API ', () => { expect(true) });
  it('test 006-list: ►valid request◄ get a valid list of doctors entity', () => {
    return request(app.getHttpServer())
      .post('/person3/list')
      .send({
        "mode": "all&count",
        "limit": 2,
        "page": 1,
        "entityName": "doctors"
      })
      .expect(201);
  });
  it('test 007-list: ►valid request◄ get a valid list of doctors entity with the filter of gouping just females', () => {
    return request(app.getHttpServer())
      .post('/person3/list')
      .send({
        "mode": "grouping&all&count",
        "limit": 2,
        "page": 1,
        "entityName": "doctors",
        "groupingKey": "gender",
        "groupingVal": "female"
      })
      .expect(201);
  });
  it('test 008-list: ►server detects not expected params provided◄ get an invalid doctors entity list,not all required options provided,expected 412', () => {
    return request(app.getHttpServer())
      .post('/person3/list')
      .send({
        "mode": "all&count",
        "limit": 2,
        "page": 1
      })
      .expect(412);
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ updatePerson API ', () => { expect(true) });
  it('test 009-updatePerson: ►valid request◄ update a person tels to ["1000", "2000"] & birthday=1000', () => {
    return request(app.getHttpServer())
      .patch("/person3/updatePerson")
      .send({
        "_id": newUserId,
        "tels": ["1000", "2000"],
        "mail": "a@b.c",
        "fatherName": "mehrdad",
        "motherName": "helen",
        "countryOfBirth": "iran",
        "cityOfBirth": "tehran",
        "citizenshipNumber": 22,
        "job": "clinicalPhysician"
      })
      .expect(200)
      .then((res) => {
        expect(res.body.tels).toEqual(["1000", "2000"]);
        expect(res.body.status).toBe(1);
      })
  });
  it('test 010-updatePerson: ►incorrect params value◄ update a person with fake id, expected PRECONDITION_FAILED 412 ', () => {
    return request(app.getHttpServer())
      .patch("/person3/updatePerson")
      .send({
        "_id": "61c48d7d9620e910ffc0aaaa",
        "tel1": 100,
        "tel2": 2343209483,
        "mail": "a@b.c",
        "fatherName": "mehrdad",
        "motherName": "helen",
        "countryOfBirth": "iran",
        "cityOfBirth": "tehran",
        "citizenshipNumber": 22,
        "job": "clinicalPhysician"
      })
      .expect(412);
  });
  it('test 011-updatePerson: ►server detects not expected params provided◄ not all of the required options provided,expected still ok & partial update', () => {
    return request(app.getHttpServer())
      .patch("/person3/updatePerson")
      .send({
        "_id": newUserId,
        "tels": ["23432"],
        "fatherName": "mehrdad",
        "motherName": "helen",
        "countryOfBirth": "iran",
        "cityOfBirth": "tehran",
        "citizenshipNumber": 22,
        "job": "clinicalPhysician"
      })
      .expect(200);
  });
  it('test 012-updatePerson: ►incorrect params types◄ update a person but fathename is number instead of number, expected 400 bad request', () => {
    return request(app.getHttpServer())
      .patch("/person3/updatePerson")
      .send({
        "_id": newUserId,
        "tel1": "100",
        "tel2": 2343209483,
        "mail": "a@b.c",
        "fatherName": 781987,
        "motherName": "helen",
        "countryOfBirth": "iran",
        "cityOfBirth": "tehran",
        "citizenshipNumber": 22,
        "job": "clinicalPhysician"
      })
      .expect(400);
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ searchPersons API ', () => { expect(true) });
  it('create a fake person to test search APIs, name: ali, family: gagaga', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "ali",
        "family": "gagaga",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": 32432432
      })
      .expect(201)
      .then((res) => {
        newUserId = res.body._id;
        expect(res.body.status).toBeDefined();
      })
  });
  it('create a fake person to test search APIs, name: kalepooke, family: gholi', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "kalepooke",
        "family": "gholi",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": 32432432
      })
      .expect(201)
      .then((res) => {
        newUserId = res.body._id;
        expect(res.body.status).toBeDefined();
      })
  });
  it('test 013-searchPersons: ►valid request◄ search for everybody that has \'li\' in their name or family, expected 201 ok & two results at least', () => {
    return request(app.getHttpServer())
      .post("/person3/search")
      .send({
        "keys": [
            "name",
            "family"
        ],
        "searchText": "li",
        "entityName": "doctors"
      })
      .expect(201)
      .then((res) => {
        expect(res.body.count).toBeGreaterThan(1);
      })
  });
  it('test 014-searchPersons: ►incorrect params value◄ search for everybody that has \'li\' in their name or shamily, expected 412 PRECONDITION_FAILED', () => {
    return request(app.getHttpServer())
      .post("/person3/search")
      .send({
        "keys": [
            "name",
            "shamily"
        ],
        "searchText": "li",
        "entityName": "doctors"
      })
      .expect(412);
  });
  it('test 015-searchPersons: ►incorrect params types◄ search for everybody that has \'li\' in their name or 2, expected 412 PRECONDITION_FAILED', () => {
    return request(app.getHttpServer())
      .post("/person3/search")
      .send({
        "keys": [
            "name",
            2
        ],
        "searchText": "li",
        "entityName": "doctors"
      })
      .expect(412);
  });
  it('test 016-searchPersons: ►server detects not expected params provided◄ not all of the required options provided,expected PRECONDITION_FAILED 412', () => {
    return request(app.getHttpServer())
      .post("/person3/search")
      .send({
        "keys": [
            "name",
            "family"
        ],
        "entityName": "doctors"
      })
      .expect(412);
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ searchWithConds API ', () => { expect(true) });
  it('create a fake person to test searchWithConds APIs with country=iran & city=tehran', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "ali",
        "family": "gagaga",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": 32432432
      })
      .expect(201)
      .then((res) => {
        newUserId = res.body._id;
        expect(res.body.status).toBeDefined();
      })
  });
  it('update that fake person', () => {
    return request(app.getHttpServer())
      .patch("/person3/updatePerson")
      .send({
        "_id": newUserId,
        "tels": ["1000", "2000"],
        "mail": "a@b.c",
        "fatherName": "mehrdad",
        "motherName": "helen",
        "countryOfBirth": "iran",
        "cityOfBirth": "tehran",
        "citizenshipNumber": 22,
        "job": "clinicalPhysician"
      })
      .expect(200)
      .then((res) => {
        expect(res.body.tels).toEqual(["1000", "2000"]);
        expect(res.body.status).toBe(1);
      })
  });
  it('create a fake person to test searchWithConds APIs with country=usa & city=tehran', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "ali",
        "family": "gagaga",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": 32432432
      })
      .expect(201)
      .then((res) => {
        newUserId = res.body._id;
        expect(res.body.status).toBeDefined();
      })
  });
  it('update that fake person', () => {
    return request(app.getHttpServer())
      .patch("/person3/updatePerson")
      .send({
        "_id": newUserId,
        "tels": ["23", "24"],
        "mail": "a@b.c",
        "fatherName": "mehrdad",
        "motherName": "helen",
        "countryOfBirth": "usa",
        "cityOfBirth": "tehran",
        "citizenshipNumber": 22,
        "job": "clinicalPhysician"
      })
      .expect(200)
      .then((res) => {
        expect(res.body.tels).toEqual(["23", "24"]);
        expect(res.body.status).toBe(1);
      })
  });
  it('test 017-searchPersons: ►valid request◄ search for every doctor that his cityOfBirth=california & countryOfBrith=usa', () => {
    return request(app.getHttpServer())
      .post("/person3/searchWithConds")
      .send({
        "limit": 10,
        "page": 1,
        "andKeys": [
            ["cityOfBirth", "tehran", "="],
            ["countryOfBirth", "usa", "="]
        ],
        "entityName": "doctors"
      })
      .expect(201)
      .then((res) => {
        expect(res.body.count).toBeGreaterThan(0);
      })
  });
  it('test 018-searchPersons: ►valid request◄ search for every doctor whoose his city is tehran', () => {
    return request(app.getHttpServer())
      .post("/person3/searchWithConds")
      .send({
        "limit": 10,
        "page": 1,
        "orKeys": [
          ["cityOfBirth", "tehran", "="]
        ],
        "entityName": "doctors"
      })
      .expect(201)
      .then((res) => {
        expect(res.body.count).toBeGreaterThan(1);
      })
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ groupList ', () => { expect(true) });
  it('test 019-searchPersons: ►valid request◄ group by name', () => {
    return request(app.getHttpServer())
      .post('/person3/groupList')
      .send({
        "entityName": "doctors",
        "groupingKey": "name"
      })
      .expect(201);
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ deletePerson API ', () => { expect(true) });
  it('test 020-deletePerson: ►valid request◄ delete a person with a valid existing id, expected 200 ok', () => {
    return request(app.getHttpServer())
      .delete("/person3/delPerson")
      .send({
        "_id": newUserId
      })
      .expect(200);
  });
  it('test 021-deletePerson: ►incorrect params value◄ delete a person with an id which not exists, expected 200 ok', () => {
    return request(app.getHttpServer())
      .delete("/person3/delPerson")
      .send({
        "_id": newUserId
      })
      .expect(200);
  });
  it('test 022-deletePerson: ►server detects not expected params provided◄ no _id key is provided, expected 200 ok', () => {
    return request(app.getHttpServer())
      .delete("/person3/delPerson")
      .send({})
      .expect(200);
  });
  it('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ delPersons API ', () => { expect(true) });
  it('create a fake person to test delPersons', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "ali",
        "family": "gagaga",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": 32432432
      })
      .expect(201)
      .then((res) => {
        usersToBeDeleted.push = res.body._id;
        expect(res.body.status).toBeDefined();
      })
  });
  it('create a fake person to test delPersons', () => {
    return request(app.getHttpServer())
      .post('/person3/createPerson')
      .send({
        "entityName": "doctors",
        "name": "ali",
        "family": "gagaga",
        "idCardNum": 454342343,
        "gender": "male",
        "employmentStartDate": 45345435435,
        "birthDate": 32432432
      })
      .expect(201)
      .then((res) => {
        usersToBeDeleted.push = res.body._id;
        expect(res.body.status).toBeDefined();
      })
  });
  it('test 023-deletePerson: ►valid request◄ no _id key is provided, expected 200 ok', () => {
    return request(app.getHttpServer())
      .delete("/person3/delPerson")
      .send({
        "listOfIds": [
          `${usersToBeDeleted[0]}`,
          `${usersToBeDeleted[1]}`
        ]
      })
      .expect(200);
  });
  it('test 024-deletePerson: ►incorrect params value◄ incorrect IDs', () => {
    return request(app.getHttpServer())
      .delete("/person3/delPerson")
      .send({
        "listOfIds": [
          "61c5f36bff8470a1ec0ea498"
        ]
      })
      .expect(200);
  });
});