import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySchema } from './model/company.model';
import { SectionSchema } from './model/section.model';
import { Person3Module } from 'src/person3/person3.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Company',
        schema: CompanySchema,
      },
      {
        name: 'Section',
        schema: SectionSchema,
      },
    ]),
    Person3Module,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
