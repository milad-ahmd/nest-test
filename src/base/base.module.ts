import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { GlobalModule } from '../global/global.module';
import { ProvinceController } from './province.controller';
import { ProvinceService } from './services/province.service';
import { CityService } from './services/city.service';
import { CitySchema } from './model/city.model';
import { ProvinceSchema } from './model/province.model';
import { CityController } from './city.controller';
import { CountryController } from './country.controller';
import { CountrySchema } from './model/country.model';
import { CountryService } from './services/country.service';
import { NationalityController } from './nationality.controller';
import { NationalityService } from './services/nationality.service';
import { NationalitySchema } from './model/nationality.model';
import { CurrencySchema } from './model/currency.model';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './services/currency.service';

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
        name: 'City',
        schema: CitySchema,
      },
      {
        name: 'currencies',
        schema: CurrencySchema,
      },
      {
        name: 'Province',
        schema: ProvinceSchema,
      },
      {
        name: 'Country',
        schema: CountrySchema,
      },
      {
        name: 'Nationality',
        schema: NationalitySchema,
      },
      {
        name: 'currencies',
        schema: CurrencySchema,
      },
    ]),
    GlobalModule,
  ],
  controllers: [
    ProvinceController,
    CityController,
    CurrencyController,
    CountryController,
    NationalityController,
  ],
  providers: [
    ProvinceService,
    CityService,
    CountryService,
    CurrencyService,
    NationalityService,
  ],
  exports: [
    ProvinceService,
    CityService,
    CountryService,
    CurrencyService,
    NationalityService,
  ],
})
export class BaseModule {}
