import {
  Module
} from '@nestjs/common';
import {
  MongooseModule
} from '@nestjs/mongoose';
import {
  PersonSchema
} from './model/person.model';
import {
  Expertise,
  ExpertiseSchema
} from '../person3/model/expertise.schema';
import {
  PersonController
} from './person.controller';
import {
  PersonService
} from './person.service';
import {
  HttpModule
} from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 100,
      }),
    }),
    MongooseModule.forFeature([{
        name: 'Person',
        schema: PersonSchema
      }
    ]),
  ],
  controllers: [PersonController],
  providers: [PersonService]
})
export class PersonModule {}