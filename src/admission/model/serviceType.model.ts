import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'serviceTypes' })
export class ServiceType extends Document {
  @Prop()
  name: string;
}
export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);
