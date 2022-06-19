import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'sections' })
export class Section extends Document {
  @Prop()
  name: string;
  @Prop({
    required: true,
  })
  companyId: string;
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Person' })
  persons: [Types.ObjectId];
}
export const SectionSchema = SchemaFactory.createForClass(Section);
