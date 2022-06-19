import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { LabTypeEnum } from '../enum/labType.enum';
@Schema({ _id: false })
class PriceDetail extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Test' })
  test: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Method' })
  method: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Sample' })
  sample: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'services' })
  service: Types.ObjectId;
  @Prop()
  issuedDate: number;
  @Prop()
  price: number;
  @Prop({ default: true })
  isActive: boolean;
}
const priceDetailSchema = SchemaFactory.createForClass(PriceDetail);

@Schema({ collection: 'priceLists', timestamps: true })
export class PriceList extends Document {
  @Prop()
  name: string;
  @Prop({
    type: String,
  })
  labType: LabTypeEnum;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  company: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'currencies' })
  currency: Types.ObjectId;
  @Prop()
  startDate: number;
  @Prop()
  endDate: number;
  @Prop({ type: [priceDetailSchema] })
  priceDetails: PriceDetail[];
  @Prop({ default: true })
  isActive: boolean;
}
export const PriceListSchema = SchemaFactory.createForClass(PriceList);
