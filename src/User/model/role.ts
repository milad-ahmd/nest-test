import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Privilege } from './privilege.enum';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop()
  name: string;
  @Prop()
  privileges: Privilege[];
}
export const Roles = SchemaFactory.createForClass(Role);
