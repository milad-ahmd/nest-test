import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'services' })
export class Service extends Document {
  @Prop()
  service: string;
  @Prop()
  unitPrice: number;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'currencies' })
  currency: Types.ObjectId;
  @Prop()
  priceDetail: string;
}
export const serviceSchema = SchemaFactory.createForClass(Service);
