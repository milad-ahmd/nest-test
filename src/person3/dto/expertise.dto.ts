import { IsString, IsOptional } from 'class-validator';

export class ExpertisDto {
    @IsOptional()
    @IsString()
    name:string;
}