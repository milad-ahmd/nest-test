import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AuthInput {
  @Field({ nullable: false })
  mobile: string;
  @Field({ nullable: true })
  code: string;
  @Field(() => Date, { nullable: true })
  createDate: Date;
  @Field(() => Date, { nullable: true })
  expireDate: Date;
  @Field(() => Boolean, { nullable: true })
  isVerified: boolean;
}

@InputType()
export class VerifyInput {
  @Field(() => String, { nullable: false })
  id: string;
  @Field(() => String, { nullable: false })
  code: string;
}

@InputType()
export class DeleteInput {
  @Field(() => String, { nullable: false })
  id: string;
}

@InputType()
export class LoginInput {
  @Field(() => String, { nullable: false })
  username: string;
  @Field(() => String, { nullable: false })
  password: string;
}
