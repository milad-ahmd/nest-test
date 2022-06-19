import { IsString, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CountryDto {
  @IsOptional()
  @IsString()
  name: string;
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
