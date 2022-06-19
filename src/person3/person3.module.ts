import { Module } from '@nestjs/common';
import { PersonController } from './person3.controller';
import { Person3Service } from './person3.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Person3Schema } from './model/person3.model';
import { HttpModule } from '@nestjs/axios';
import { GlobalModule } from '../global/global.module';
import { ExpertiseSchema } from './model/expertise.schema';
import { ExpertiseController } from './expertise.controller';
import { ExpertiseService } from './expertise.service';
import { HttpService } from '@nestjs/axios';
import { StatesSchema } from './model/states.schema';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 20000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: 'Person3',
        schema: Person3Schema,
      },
      {
        name: 'Expertise',
        schema: ExpertiseSchema,
      },
      {
        name: 'States',
        schema: StatesSchema,
      },
    ]),
    GlobalModule,
  ],
  controllers: [PersonController, ExpertiseController],
  providers: [Person3Service, ExpertiseService],
  exports: [Person3Service, ExpertiseService],
})
export class Person3Module {}
