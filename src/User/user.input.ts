import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field(() => String, { nullable: true })
  name: string;
  @Field(() => String, { nullable: true })
  family: string;
  @Field(() => String, { nullable: false })
  username: string;
  @Field(() => String, { nullable: false })
  password: string;
  @Field(() => String, { nullable: false })
  forgetPassToken: string;
  @Field(() => String, { nullable: false })
  forgetPassTs: string;
  @Field(() => String, { nullable: false })
  mobile: string;
  @Field(() => String, { nullable: false })
  mail: string;
  @Field(() => Date, { nullable: true })
  createDate: Date;
  @Field(() => Boolean, { nullable: true })
  isVerified: boolean;
  @Field(() => [String], { nullable: true })
  roles: string[];
}

@InputType()
export class UserVerifyInput {
  @Field(() => String, { nullable: false })
  id: string;
  @Field(() => String, { nullable: false })
  code: string;
}

@InputType()
export class UserDeleteInput {
  @Field(() => String, { nullable: false })
  id: string;
}
