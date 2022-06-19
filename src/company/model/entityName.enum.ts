import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum LabEnum {
  LABERJAI = 'labErjai',
  LABBIMARESTANI = 'labBimarestani',
}
export enum CompanyEntityName {
  LABERJAI = 'labErjai',
  LABBIMARESTANI = 'labBimarestani',
  ORGANIZATION = 'organization',
}
export enum CompanyType {
  LABERJAI = 'labErjai',
  LABBIMARESTANI = 'labBimarestani',
  ORGANIZATION = 'organization',
}
export class EntityNameDto {
  @IsOptional()
  @IsEnum(LabEnum)
  entityName: LabEnum;
}
