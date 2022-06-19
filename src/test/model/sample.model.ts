import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'samples' })
export class Sample extends Document {
  @Prop()
  name: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Grouping' })
  group: Types.ObjectId;
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Container' })
  containers: [Types.ObjectId];
  @Prop()
  isActive: boolean;
  @Prop()
  groupName: string;
}
export const SampleSchema = SchemaFactory.createForClass(Sample);
