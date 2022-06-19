import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'countries' })
export class Country extends Document {
  @Prop({ unique: true })
  name: string;
}
export const CountrySchema = SchemaFactory.createForClass(Country);
