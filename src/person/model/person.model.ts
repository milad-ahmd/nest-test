import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: 'persons' })
export class Person extends Document {
    @Prop({required: true})
    entityName: string;
    @Prop()
    userId: string;
    @Prop()
    companyId: string;
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
    middleName: string;
    @Prop()
    family: string;
    @Prop()
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
    nationalCode: number;
    @Prop()
    economicCode: number;
    @Prop()
    type: string;
    @Prop()
    enterpriseCode: number;
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
    employeeCode: number;
    @Prop()
    employmentStartDate: number;
    @Prop()
    employmentEndDate: number;
    @Prop()
    position: string;
    @Prop()
    idCardNum: number;
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
        default():any {
            return Date.now()
        }
    })
    createDate:Date;
    @Prop({default: false})
    isVerified:boolean;
}
export const PersonSchema = SchemaFactory.createForClass(Person);

let allTrue = {
    _id: true,
    entityName: true,
    userId: true,
    companyId: true,
    username: true,
    password: true,
    mail: true,
    name: true,
    middleName: true,
    family: true,
    gender: true,
    nationality: true,
    tel1: true,
    tel2: true,
    fatherName: true,
    motherName: true,
    address: true,
    bank: true,
    role: true,
    registrationNum: true,
    nationalCode: true,
    economicCode: true,
    type: true,
    enterpriseCode: true,
    founderName: true,
    licenceNum: true,
    technicalName: true,
    contactList: true,
    medicalNumber: true,
    proficiency: true,
    employeeCode: true,
    employmentStartDate: true,
    employmentEndDate: true,
    position: true,
    idCardNum: true,
    citizenshipNumber: true,
    birthDate: true,
    cityOfBirth: true,
    countryOfBirth: true,
    signature: true,
    enterprise: true,
    job: true,
    title: true,
    isActive: true,
}
export const validKeys = {
    personExists: allTrue,
    createPerson: allTrue,
    readPerson: allTrue,
    updatePerson: allTrue,
    delPerson: allTrue,
    search: allTrue,
    searchWithConds: allTrue,
    getCities: allTrue,
    getCountries: allTrue
}