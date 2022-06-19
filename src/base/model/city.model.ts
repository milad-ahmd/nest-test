import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'cities' })
export class City extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Province' })
  province: Types.ObjectId;
  @Prop()
  name: string;
}
export const CitySchema = SchemaFactory.createForClass(City);
