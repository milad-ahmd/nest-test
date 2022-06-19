import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from './role';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  name?: string | null;

  @Prop()
  family?: string | null;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  mobile: string;

  @Prop()
  mail: string;

  @Prop()
  forgetPassToken: string;

  @Prop()
  forgetPassTs: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: Role.name })
  roles: [Types.ObjectId];
}
export const Users = SchemaFactory.createForClass(User);
