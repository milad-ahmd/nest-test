import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
class Conditions extends Document {
  @Prop()
  isActive: boolean;

  @Prop()
  description: string;
}

const conditionsSchema = SchemaFactory.createForClass(Conditions);

@Schema({ _id: false })
class SampleCondition extends Document {
  @Prop()
  to: number;
  @Prop()
  from: number;
  @Prop()
  title: string;
  @Prop()
  unit: string;
}
const sampleConditionSchema = SchemaFactory.createForClass(SampleCondition);

@Schema({ _id: false })
class SampleDetail extends Document {
  @Prop()
  isMain: boolean;
  @Prop()
  location: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Sample' })
  sample: Types.ObjectId;
  @Prop({ type: [sampleConditionSchema] })
  conditions: SampleCondition[];
}
const sampleDetailSchema = SchemaFactory.createForClass(SampleDetail);

@Schema({ collection: 'tests' })
export class Test extends Document {
  @Prop(
    raw({
      fullName: { type: String },
      shortName: { type: String },
    }),
  )
  name: Record<string, any>;
  @Prop(
    raw({
      alphabetic: { type: String },
      numeric: { type: String },
    }),
  )
  coding: Record<string, any>;
  @Prop(
    raw({
      gender: { type: String },
      description: { type: String },
      ageFrom: { type: Number },
      ageTo: { type: Number },
      isActive: { type: Boolean },
    }),
  )
  limitations: Record<string, any>;
  @Prop({ type: [conditionsSchema] })
  conditions: Conditions[];
  @Prop({ type: [sampleDetailSchema] })
  sampleDetails: SampleDetail[];
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Test' })
  testSubsets: [Types.ObjectId];
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Test' })
  relatedTests: [Types.ObjectId];
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Test' })
  parent: Types.ObjectId;
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Method' })
  methods: [Types.ObjectId];
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Method' })
  favMethods: [Types.ObjectId];
  @Prop(
    raw({
      parentName: { type: String },
      testPurpose: { type: String },
      prescriptionReason: { type: String },
      testPreparation: { type: String },
      orderInstruction: { type: String },
      checkingInstruction: { type: String },
      persianTestName: { type: String },
      panels: { type: [String] },
      otherTestNames: { type: [String] },
    }),
  )
  moreInfo: Record<string, any>;
  @Prop()
  isMandatory: boolean;
  @Prop()
  scientificGrouping: string;
  @Prop()
  isOrderable: boolean;
  @Prop()
  isActive: boolean;
  @Prop()
  isParent: boolean;
  @Prop()
  independent: boolean;
}

export const TestSchema = SchemaFactory.createForClass(Test);
