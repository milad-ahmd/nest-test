import { Field,  ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateJwtDto{

    @Field(()=>String)
    access_token:string;

    @Field({nullable:true})
    refresh_token?:string;



}