import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { CompanyEntityName } from '../../company/model/entityName.enum';
import { GroupingType } from './entityName.enum';

@Schema({ collection: 'groupings' })
export class Grouping extends Document {
  @Prop()
  name: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Grouping' })
  parent: Types.ObjectId;
  @Prop({ default: false })
  isActive: boolean;
  @Prop({
    required: true,
    type: String,
  })
  type: GroupingType;
}
export const GroupingSchema = SchemaFactory.createForClass(Grouping);
