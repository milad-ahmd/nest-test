import { Expose, Exclude, Type, Transform } from 'class-transformer';
import { EntityName } from '../model/entityName.enum';
import { Gender } from '../model/gender.enum';
import { ValidateNested } from 'class-validator';

import { ObjectId } from 'bson';
import { plainToClass } from 'class-transformer';
import assert from 'assert';


export class PersonValidOutDto {
    @Exclude()
    password: String;
    @Transform((from: any) => from.obj._id, { toClassOnly: true })
    @Expose()
    _id ?: ObjectId;
    @Expose()
    isVerified: boolean;
    @Expose()
    createDate: Date;
    @Expose()
    status: number;
    @Expose()
    entityName: EntityName;
    @Expose()
    name:string;
    @Expose()
    family:string;
    @Expose()
    idCardNum: number;
    @Expose()
    gender: Gender;
    @Expose()
    employmentStartDate: number;
    @Expose()
    birthDate: number;
    @Expose()
    mode: string;
    @Expose()
    limit: number;
    @Expose()
    page: number;
    @Expose()
    groupingKey: string;
    @Expose()
    groupingVal: string;
    @Expose()
    @ValidateNested({ each: true })
    @Type(() => PersonValidOutDto)
    persons: PersonValidOutDto[];
    @Expose()
    count: number;
    @Expose()
    tels: string[];
    @Expose()
    mail: string;
    @Expose()
    fatherName: string;
    @Expose()
    motherName: string;
    @Expose()
    countryOfBirth: string;
    @Expose()
    cityOfBirth: string;
    @Expose()
    citizenshipNumber: string;
    @Expose()
    job: string;
    @Expose()
    expertiseName: string;
    @Expose()
    expertiseId: string;
    @Expose()
    isActive: boolean;
}