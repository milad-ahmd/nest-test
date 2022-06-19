import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { AdmissionType } from '../enum/type.enum';
import { AdmissionStatus } from '../enum/status.enum';

@Schema({ _id: false })
class Prescription extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'doctors' })
  doctor: Types.ObjectId;
  @Prop()
  prescriptionDate: number;
  @Prop()
  prescriptionCode: string;
  @Prop()
  internalAdmissionCode: string;
  @Prop()
  referral: string;
}
const prescriptionSchema = SchemaFactory.createForClass(Prescription);

@Schema({ _id: false })
class SampleStatus extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Method' })
  method: Types.ObjectId;
  @Prop()
  status: string;
}
const sampleStatusSchema = SchemaFactory.createForClass(SampleStatus);

@Schema({ _id: false })
class TestDetail extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Test' })
  test: Types.ObjectId;
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Method' })
  methods: [Types.ObjectId];
  // @Prop({ type: [sampleStatusSchema] })
  // sampleStatuses: SampleStatus[];
  @Prop()
  order: number;
  @Prop()
  price: string;
  @Prop()
  prescriptionCode: string;
}
@Schema({ _id: false })
class ServiceDetail extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'services' })
  service: Types.ObjectId;
  @Prop()
  price: string;
}
const serviceDetailSchema = SchemaFactory.createForClass(ServiceDetail);
const testDetailSchema = SchemaFactory.createForClass(TestDetail);

@Schema({ collection: 'admissions', timestamps: true })
export class Admission extends Document {
  @Prop({ unique: true })
  code: string;
  @Prop()
  enquiry: string;
  @Prop()
  remark: string;
  @Prop()
  serviceType: string;
  @Prop()
  origin: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Person3' })
  patient: Types.ObjectId;
  @Prop({
    // required: true,
    type: String,
  })
  type: AdmissionType;
  @Prop({
    // required: true,
    type: String,
  })
  status: AdmissionStatus;
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'services' })
  services: [Types.ObjectId];
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  owner: Types.ObjectId;
  @Prop({ type: [prescriptionSchema] })
  prescriptions: Prescription[];
  @Prop({ type: [testDetailSchema] })
  testDetails: TestDetail[];
  @Prop({ type: [serviceDetailSchema] })
  serviceDetails: ServiceDetail[];
  @Prop(
    raw({
      description: { type: String },
      answerDate: { type: Date },
      priority: { type: Number },
      status: { type: String },
    }),
  )
  detail: Record<string, any>;
  @Prop({ default: true })
  isTemp: boolean;
}
export const AdmissionSchema = SchemaFactory.createForClass(Admission);
