import { IsString, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CityDto {
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
  province: string;
}
