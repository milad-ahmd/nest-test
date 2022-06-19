import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'provinces' })
export class Province extends Document {
  @Prop({ unique: true })
  name: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Country' })
  country: Types.ObjectId;
}
export const ProvinceSchema = SchemaFactory.createForClass(Province);
