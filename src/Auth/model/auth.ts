import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Auth extends Document {
  @Prop()
  mobile: string;

  @Prop({ default: Math.floor(1000 + Math.random() * 8999) })
  code: string;

  @Prop({
    default(): any {
      return new Date();
    },
  })
  createDate: Date;

  @Prop({
    default(): any {
      return new Date(new Date().getTime() + 120 * 1000);
    },
  })
  expireDate: Date;

  @Prop({ default: false })
  isVerified: boolean;
}
export const Auths = SchemaFactory.createForClass(Auth);
