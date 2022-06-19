import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { CompanyEntityName, CompanyType } from './entityName.enum';

@Schema({ collection: 'companies', timestamps: true })
export class Company extends Document {
  @Prop({
    required: true,
    type: String,
  })
  companyEntityName: CompanyEntityName;
  @Prop()
  companyType: string;
  @Prop()
  role: string;
  @Prop()
  tels: string[];
  @Prop()
  addrDetail: string;
  @Prop()
  addrTitle: string;
  @Prop()
  banks: string[];
  @Prop()
  enterpriseName: string;
  @Prop()
  enterpriseCode: string;
  @Prop()
  username: string;
  @Prop()
  password: string;
  @Prop()
  mail: string;
  @Prop({
    type: [{ title: { type: String }, description: { type: String } }],
  })
  addresses: { title: string; description: string }[];
  @Prop()
  nationality: string;
  @Prop()
  registrationNumber: number;
  @Prop()
  nationalCode: string;
  @Prop()
  economicCode: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'persons' })
  founderPersonId: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'persons' })
  technicalPersonId: Types.ObjectId;
  @Prop()
  licenceNum: number;
  @Prop()
  isActive: boolean;
  @Prop({
    default(): any {
      return Date.now();
    },
  })
  createDate: Date;
  @Prop({ default: false })
  isVerified: boolean;
  @Prop({ default: false })
  isTemp: boolean;
}
export const CompanySchema = SchemaFactory.createForClass(Company);

const allTrue = {
  _id: true,
  entityName: true,
  tes: true,
  addressText: true,
  addressTitle: true,
  banks: true,
  enterpriseName: true,
  enterpriseCode: true,
  username: true,
  password: true,
  mail: true,
  role: true,
  nationality: true,
  registrationNumber: true,
  nationalCode: true,
  economicCode: true,
  founderName: true,
  licenceNum: true,
  technicalName: true,
  contactList: true,
  isActive: true,
};
export const validKeys = {
  companyExists: allTrue,
  createCompany: allTrue,
  readCompany: allTrue,
  updateCompany: allTrue,
  delCompany: allTrue,
  search: allTrue,
  searchWithConds: allTrue,
};
