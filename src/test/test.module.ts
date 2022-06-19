import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './services/test.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestSchema } from './model/test.model';
import { ContainerSchema } from './model/container.model';
import { SampleSchema } from './model/sample.model';
import { GroupingSchema } from './model/grouping.model';
import { MethodSchema } from './model/method.model';
import { MethodController } from './method.controller';
import { ContainerController } from './container.controller';
import { SampleController } from './sample.controller';
import { GroupingController } from './grouping.controller';
import { MethodService } from './services/method.service';
import { GroupingService } from './services/grouping.service';
import { ContainerService } from './services/container.service';
import { SampleService } from './services/sample.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Test',
        schema: TestSchema,
      },
      {
        name: 'Container',
        schema: ContainerSchema,
      },
      {
        name: 'Sample',
        schema: SampleSchema,
      },
      {
        name: 'Grouping',
        schema: GroupingSchema,
      },
      {
        name: 'Method',
        schema: MethodSchema,
      },
    ]),
  ],
  controllers: [
    TestController,
    MethodController,
    ContainerController,
    SampleController,
    GroupingController,
  ],
  providers: [
    TestService,
    MethodService,
    ContainerService,
    SampleService,
    GroupingService,
  ],
})
export class TestModule {}
