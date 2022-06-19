import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { AuthModule } from './Auth/auth.module';
import { join } from 'path';
import { AppController } from './app.controller';
import { UserModule } from './User/user.module';
import { PersonModule } from './person/person.module';
import { Person3Module } from './person3/person3.module';
import { CompanyModule } from './company/company.module';
import { GlobalModule } from './global/global.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SerializeInterceptor } from './interceptors/serialize.interceptor';
import { TestModule } from './test/test.module';
import { BaseModule } from './base/base.module';
import { AdmissionModule } from './admission/admission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    AuthModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      installSubscriptionHandlers: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    UserModule,
    PersonModule,
    Person3Module,
    CompanyModule,
    BaseModule,
    TestModule,
    GlobalModule,
    AdmissionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    },
  ],
})
export class AppModule {}
