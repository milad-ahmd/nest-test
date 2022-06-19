import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'doctors' })
export class Doctor extends Document {
  @Prop()
  name: string;
  @Prop()
  medicalNumber: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Expertise' })
  expertise: Types.ObjectId;
}
export const doctorSchema = SchemaFactory.createForClass(Doctor);
