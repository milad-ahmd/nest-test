import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateAuthDto{
    @Field(()=>ID)
    id:string;
    @Field()
    mobile:string;
    @Field({nullable:true})
    code:string;
    @Field(()=>Date,{nullable:true})
    createDate:Date;
    @Field(()=>Date,{nullable:true})
    expireDate:Date;
    @Field(()=>Boolean,{nullable:true})
    isVerified:boolean;
}