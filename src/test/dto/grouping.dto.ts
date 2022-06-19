import { ObjectId } from 'mongoose';
import { IsEnum, IsOptional } from 'class-validator';
import { GroupingType } from '../model/entityName.enum';

export class GroupingDto {
  @IsOptional()
  listOfIds: string[];
  @IsOptional()
  _id: ObjectId;
  @IsOptional()
  limit: number;
  @IsOptional()
  page: number;
  @IsOptional()
  orKeys: string[];
  @IsOptional()
  andKeys: string[];
  @IsOptional()
  name: string;
  @IsOptional()
  isActive: boolean;
  @IsOptional()
  parent: string;
  @IsOptional()
  @IsEnum(GroupingType)
  type: string;
}
