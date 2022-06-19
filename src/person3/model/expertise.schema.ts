import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpertiseDocument = Expertise & Document;

@Schema({ collection: 'expertis' })
export class Expertise {
  @Prop()
  name: string;
}
export const ExpertiseSchema = SchemaFactory.createForClass(Expertise);
