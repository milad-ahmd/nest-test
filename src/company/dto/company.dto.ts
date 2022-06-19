import { ObjectId } from 'mongoose';
import { CompanyEntityName, CompanyType } from '../model/entityName.enum';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompanyDto {
  @IsOptional()
  companyType: string;
  @IsOptional()
  @IsString()
  role: string;
  @IsOptional()
  isActive: boolean;
  @IsOptional()
  isTemp: boolean;
  @IsOptional()
  isVerified: boolean;
  @IsOptional()
  listOfIds: string[];
  @IsOptional()
  _id: ObjectId;
  @IsOptional()
  limit: number;
  @IsOptional()
  page: number;
  @IsOptional()
  @IsArray()
  addresses: { title: string; description: string }[];
  @IsOptional()
  orKeys: string[];
  @IsOptional()
  andKeys: string[];
  @IsOptional()
  @IsEnum(CompanyEntityName)
  companyEntityName: string;
  @IsOptional()
  @IsEnum(CompanyEntityName)
  entityName: string;
  @IsOptional()
  @IsArray()
  tels: string[];
  @IsOptional()
  @IsString()
  addrDetail: string;
  @IsOptional()
  @IsString()
  addrTitle: string;
  @IsOptional()
  @IsArray()
  banks: string[];
  @IsOptional()
  @IsString()
  enterpriseName: string;
  @IsOptional()
  @IsString()
  enterpriseCode: string;
  @IsOptional()
  @IsString()
  username: string;
  @IsOptional()
  @IsString()
  password: string;
  @IsOptional()
  @IsString()
  mail: string;
  @IsOptional()
  @IsString()
  nationality: string;
  @IsOptional()
  @IsNumber()
  registrationNumber: number;
  @IsOptional()
  @IsString()
  nationalCode: string;
  @IsOptional()
  @IsString()
  economicCode: string;
  @IsOptional()
  @IsString()
  founderPersonId: string;
  @IsOptional()
  @IsString()
  technicalPersonId: string;
  @IsOptional()
  @IsNumber()
  licenceNum: number;
}
