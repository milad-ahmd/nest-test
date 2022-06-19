import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalService } from './global.service';
import { LogSchema } from './models/log.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
          name: 'Log',
          schema: LogSchema
      }
    ]),
  ],
  providers: [GlobalService],
  exports: [
    GlobalService
  ]
})
export class GlobalModule {}
