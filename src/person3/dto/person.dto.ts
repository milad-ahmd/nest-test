import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';
import { isValidObjectId, ObjectId } from 'mongoose';
import { EntityName } from '../model/entityName.enum';
import { Gender } from '../model/gender.enum';

export class PersonDto {
  @IsOptional()
  @IsEnum(EntityName)
  entityName: EntityName;
  @IsOptional()
  @IsArray()
  listOfIds: string[];
  @IsOptional()
  _id: ObjectId;
  @IsOptional()
  isActive: boolean;
  @IsOptional()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  family: string;
  @IsOptional()
  @IsString()
  latinName: string;
  @IsOptional()
  @IsString()
  latinFamily: string;
  @IsOptional()
  @IsString()
  userId: string;
  @IsOptional()
  @IsString()
  sectionId: string;
  @IsOptional()
  @IsString()
  companyId: string;
  @IsOptional()
  @IsString()
  middleName: string;
  @IsOptional()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  idCardNum: string;
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;
  @IsOptional()
  @IsNumber()
  employmentStartDate: number;
  @IsOptional()
  @IsNumber()
  birthDate: number;
  @IsOptional()
  @IsString()
  mode: string;
  @IsOptional()
  @IsNumber()
  limit: number;
  @IsOptional()
  @IsNumber()
  page: number;
  @IsOptional()
  @IsString()
  groupingKey: string;
  @IsOptional()
  @IsString()
  groupingVal: string;
  @IsOptional()
  @IsString()
  expertiseId: string;
  @IsOptional()
  @IsString()
  expertiseName: string;
  @IsOptional()
  @IsString()
  type: string;
  @IsOptional()
  @IsArray()
  tels: string[];
  @IsOptional()
  @IsString()
  mail: string;
  @IsOptional()
  @IsString()
  fatherName: string;
  @IsOptional()
  @IsString()
  motherName: string;
  @IsOptional()
  @IsString()
  countryOfBirth: string;
  @IsOptional()
  @IsString()
  cityOfBirth: string;
  @IsOptional()
  @IsNumber()
  citizenshipNumber: number;
  @IsOptional()
  job: string;
  @IsOptional()
  orKeys: string[];
  @IsOptional()
  andKeys: string[];
  @IsOptional()
  @IsNumber()
  medicalNumber: number;
}
