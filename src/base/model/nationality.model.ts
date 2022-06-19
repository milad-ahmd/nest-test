import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'nationalities' })
export class Nationality extends Document {
  @Prop()
  name: string;
  @Prop()
  foreign: boolean;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'currencies' })
  currency: Types.ObjectId;
}
export const NationalitySchema = SchemaFactory.createForClass(Nationality);
