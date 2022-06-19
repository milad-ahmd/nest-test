import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceTypeSchema } from './model/serviceType.model';
import { AdmissionSchema } from './model/admission.model';
import { doctorSchema } from './model/doctor.model';
import { serviceSchema } from './model/service.model';
import { AdmissionController } from './admission.controller';
import { DoctorController } from './doctor.controller';
import { ServiceController } from './service.controller';
import { ServiceTypeController } from './serviceType.controller';
import { AdmissionService } from './services/admission.service';
import { DoctorService } from './services/doctor.service';
import { ServiceService } from './services/service.service';
import { ServiceTypeService } from './services/serviceType.service';
import { Person3Module } from '../person3/person3.module';
import { PriceListSchema } from './model/priceList.model';
import { BaseModule } from '../base/base.module';
import { PriceListController } from './priceList.controller';
import { PriceListService } from './services/priceList.service';
import { TestModule } from '../test/test.module';
import { TestSchema } from '../test/model/test.model';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'admissions',
        schema: AdmissionSchema,
      },
      {
        name: 'serviceTypes',
        schema: ServiceTypeSchema,
      },
      {
        name: 'doctors',
        schema: doctorSchema,
      },
      {
        name: 'services',
        schema: serviceSchema,
      },
      {
        name: 'priceLists',
        schema: PriceListSchema,
      },
      {
        name: 'tests',
        schema: TestSchema,
      },
    ]),
    Person3Module,
    TestModule,
    BaseModule,
    HttpModule,
  ],
  controllers: [
    AdmissionController,
    PriceListController,
    DoctorController,
    ServiceController,
    ServiceTypeController,
  ],
  providers: [
    AdmissionService,
    PriceListService,
    DoctorService,
    ServiceService,
    ServiceTypeService,
  ],
  exports: [
    AdmissionService,
    DoctorService,
    PriceListService,
    ServiceService,
    ServiceTypeService,
  ],
})
export class AdmissionModule {}
