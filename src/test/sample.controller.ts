import {
  Body,
  Controller,
  Delete,
  Put,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SampleService } from './services/sample.service';
import { List } from './services/sample.service';
import { SampleDto } from './dto/sample.dto';
import { Sample } from './model/sample.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface Answer {
  status: number;
  count?: number;
  sample?: Partial<Sample>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Sample>;
    ors?: Partial<Sample>;
  };
  sortBy?: object;
}

@Controller('sample')
export class SampleController {
  constructor(private sampleService: SampleService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.SAMPLE)
  @Post('create')
  async create(@Body() body: SampleDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newSample: Sample = await this.sampleService.create(body);
      const answer = {
        status: 1,
        sample: newSample,
      };
      return answer;
    } else {
      throw new HttpException(
        'not valid request/not such a user',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.SAMPLE)
  @Get()
  async fetchAll(): Promise<Answer> {
    const samples = await this.sampleService.readAll();
    const answer = {
      status: 1,
      list: samples,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.SAMPLE)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.sampleService.godSearch(
      limit,
      page,
      filters,
      sortBy,
    );
    const answer = {
      status: 1,
      count:
        godSearchResults[0] && godSearchResults[0].totalCount[0]
          ? godSearchResults[0].totalCount[0].count
          : 0,
      list: godSearchResults[0].paginatedResults,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.SAMPLE)
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.sampleService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.SAMPLE)
  @Put('update')
  async update(@Body() body: SampleDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Sample> = await this.sampleService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      sample: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.SAMPLE)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.sampleService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      sample: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.SAMPLE)
  @Post('delSamples')
  async delCompanies(@Body() body: SampleDto) {
    const data = await this.sampleService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
