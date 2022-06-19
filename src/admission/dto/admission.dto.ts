import { ObjectId } from 'mongoose';
import { IsOptional } from 'class-validator';

export class AdmissionDto {
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
}
