import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'methods' })
export class Method extends Document {
  @Prop()
  name: string;
  @Prop()
  nameFa: string;
  @Prop()
  isActive: boolean;
}
export const MethodSchema = SchemaFactory.createForClass(Method);
