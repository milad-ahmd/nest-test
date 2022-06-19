import { IsString, IsOptional, IsNumber } from 'class-validator';
export class CreatePersonDto {
    name: string;
    username:string;
    fname: string;
    family: string;
    key: string;
    val: string;
}