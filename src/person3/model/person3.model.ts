import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Privilege } from '../../User/model/privilege.enum';
import { EntityName } from './entityName.enum';
import { Gender } from './gender.enum';

@Schema({
  collection: 'persons',
  timestamps: true,
})
export class Person3 extends Document {
  // @Prop()
  // _id: string;
  @Prop()
  status: number;
  @Prop({
    required: true,
    type: String,
    enum: EntityName,
  })
  entityName: EntityName;
  @Prop()
  userId: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId;
  @Prop()
  expertiseName: string;
  @Prop()
  expertiseId: string;
  @Prop()
  sectionId: string;
  @Prop()
  username: string;
  @Prop()
  password: string;
  @Prop()
  mail: string;
  @Prop()
  name: string;
  @Prop()
  family: string;
  @Prop()
  latinName: string;
  @Prop()
  latinFamily: string;
  @Prop()
  middleName: string;
  @Prop({
    type: String,
    enum: Gender,
  })
  gender: string;
  @Prop()
  nationality: string;
  @Prop()
  tels: string[];
  @Prop()
  fatherName: string;
  @Prop()
  motherName: string;
  @Prop()
  address: string;
  @Prop()
  bank: string;
  @Prop()
  role: string;
  @Prop()
  registrationNum: number;
  @Prop()
  nationalCode: string;
  @Prop()
  economicCode: string;
  @Prop()
  type: string;
  @Prop()
  enterpriseCode: string;
  @Prop()
  founderName: string;
  @Prop()
  licenceNum: number;
  @Prop()
  technicalName: string;
  @Prop()
  contactList: string;
  @Prop()
  medicalNumber: number;
  @Prop()
  proficiency: string;
  @Prop()
  employeeCode: string;
  @Prop()
  employmentStartDate: number;
  @Prop()
  employmentEndDate: number;
  @Prop()
  position: string;
  @Prop()
  mainPosition: string;
  @Prop()
  subPosition: string;
  @Prop()
  idCardNum: string;
  @Prop()
  citizenshipNumber: number;
  @Prop()
  birthDate: number;
  @Prop()
  cityOfBirth: string;
  @Prop()
  countryOfBirth: string;
  @Prop()
  signature: string;
  @Prop()
  enterprise: string;
  @Prop()
  job: string;
  @Prop()
  title: string;
  @Prop()
  isActive: boolean;
  @Prop({
    default(): any {
      return Date.now();
    },
  })
  createDate: Date;
  @Prop({
    default: false,
  })
  isVerified: boolean;
}
export const Person3Schema = SchemaFactory.createForClass(Person3);

const allTrue = [
  '_id',
  'entityName',
  'userId',
  'companyId',
  'expertiseId',
  'expertiseName',
  'username',
  'password',
  'mail',
  'name',
  'middleName',
  'family',
  'gender',
  'nationality',
  'tels',
  'fatherName',
  'motherName',
  'address',
  'bank',
  'role',
  'registrationNum',
  'nationalCode',
  'economicCode',
  'type',
  'enterpriseCode',
  'founderName',
  'licenceNum',
  'technicalName',
  'contactList',
  'medicalNumber',
  'proficiency',
  'employeeCode',
  'employmentStartDate',
  'employmentEndDate', //TODO:kia: should take now
  'position',
  'mainPosition',
  'subPosition',
  'idCardNum',
  'citizenshipNumber',
  'birthDate',
  'cityOfBirth',
  'countryOfBirth',
  'signature',
  'enterprise',
  'job',
  'title',
  'isActive',
  'orKeys',
  'andKeys',
  'limit',
  'page',
  'sectionId',
];

export const validKeysForPersonHandlers: {
  [key: string]: string[];
} = {
  personExists: allTrue,
  createPerson: allTrue,
  readPerson: allTrue,
  listPersons: allTrue,
  updatePerson: allTrue,
  delPerson: allTrue,
  delPersons: allTrue,
  search: allTrue,
  search2: allTrue,
  searchWithCondsAnds: allTrue,
  searchWithCondsOrs: allTrue,
  searchWithCondsMainKeys: allTrue,
  getCities: allTrue,
  getCountries: allTrue,
};
export const validKeysForPersonHandlersOldddd: {
  [key: string]: string[];
} = {
  personExists: [
    'entityName',
    'name',
    'family',
    'idCardNum',
    'gender',
    'employmentStartDate',
    'birthDate',
  ],
  createPerson: [
    'entityName',
    'name',
    'family',
    'idCardNum',
    'gender',
    'employmentStartDate',
    'birthDate',
    'tels',
    'fatherName',
    'motherName',
    'citizenshipNumber',
    'mail',
    'userId',
    'companyId',
  ],
  readPerson: ['_id'],
  listPersons: ['mode', 'limit', 'page', 'entityName'],
  updatePerson: [
    '_id',
    'tels',
    'mail',
    'fatherName',
    'motherName',
    'countryOfBirth',
    'cityOfBirth',
    'citizenshipNumber',
    'job',
  ],
  delPerson: ['_id'],
  delPersons: ['listOfIds'],
  search: ['name', 'family'],
  search2: ['keys', 'searchText', 'entityName'],
  searchWithCondsAnds: [
    'employmentStartDate',
    'employmentEndDate',
    'birthDate',
    'gender',
    'cityOfBirth',
    'countryOfBirth',
  ],
  searchWithCondsOrs: [
    'employmentStartDate',
    'employmentEndDate',
    'birthDate',
    'gender',
    'cityOfBirth',
    'countryOfBirth',
  ],
  searchWithCondsMainKeys: ['andKeys', 'orKeys', 'limit', 'page', 'entityName'],
  getCities: [
    'entityName',
    'name',
    'family',
    'idCardNum',
    'gender',
    'employmentStartDate',
    'birthDate',
  ],
  getCountries: [
    'entityName',
    'name',
    'family',
    'idCardNum',
    'gender',
    'employmentStartDate',
    'birthDate',
  ],
};
export interface ValidKeysForPersons {
  _id: string;
  entityName: EntityName;
  userId: string;
  companyId: string;
  sectionId: string;
  username: string;
  password: string;
  mail: string;
  name: string;
  middleName: string;
  family: string;
  gender: Gender;
  nationality: string;
  tels: string[];
  fatherName: string;
  motherName: string;
  address: string;
  bank: string;
  role: Privilege;
  registrationNum: number;
  nationalCode: string;
  economicCode: string;
  type: string;
  enterpriseCode: string;
  founderName: string;
  licenceNum: number;
  technicalName: string;
  contactList: string;
  medicalNumber: number;
  proficiency: string;
  employeeCode: string;
  employmentStartDate: number;
  employmentEndDate: number;
  position: string;
  mainPosition: string;
  subPosition: string;
  idCardNum: number;
  citizenshipNumber: number;
  birthDate: number;
  cityOfBirth: string;
  countryOfBirth: string;
  signature: string;
  enterprise: string;
  job: string;
  title: string;
  isActive: boolean;
}
