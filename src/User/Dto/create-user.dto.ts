import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateUserDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string | null;

  @Field({ nullable: true })
  family?: string | null;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  mobile: string;

  @Field()
  mail: string;

  @Field()
  forgetPassToken: string;

  @Field()
  forgetPassTs: string;

  @Field(() => Date)
  createDate: Date;

  @Field(() => Boolean)
  isVerified: boolean;

  @Field(() => [String])
  roles: string[];
}
