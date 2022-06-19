import { ObjectId } from 'mongoose';
import { IsOptional } from 'class-validator';
import { Prop } from '@nestjs/mongoose';

export class SampleDto {
  @IsOptional()
  isActive: boolean;
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
  group: string;
  @IsOptional()
  containers: string[];
  @IsOptional()
  groupName: string;
}
