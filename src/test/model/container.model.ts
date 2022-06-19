import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'containers' })
export class Container extends Document {
  @Prop()
  name: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Grouping' })
  group: Types.ObjectId;
}
export const ContainerSchema = SchemaFactory.createForClass(Container);
