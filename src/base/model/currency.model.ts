import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'currencies' })
export class Currency extends Document {
  @Prop({ unique: true })
  name: string;
  @Prop()
  symbol: string;
}
export const CurrencySchema = SchemaFactory.createForClass(Currency);
