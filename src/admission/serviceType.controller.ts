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
} from '@nestjs/common';
import { ServiceTypeService } from './services/serviceType.service';
import { List } from './services/serviceType.service';
import { ServiceType } from './model/serviceType.model';

interface Answer {
  status: number;
  count?: number;
  serviceType?: Partial<ServiceType>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<ServiceType>;
    ors?: Partial<ServiceType>;
  };
  sortBy?: object;
}

@Controller('serviceType')
export class ServiceTypeController {
  constructor(private serviceTypeService: ServiceTypeService) {}
  @Post('create')
  async create(@Body() body: any): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newServiceType: ServiceType = await this.serviceTypeService.create(body);
      const answer = {
        status: 1,
        serviceType: newServiceType,
      };
      return answer;
    } else {
      throw new HttpException(
        'not valid request/not such a user',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }

  @Get()
  async fetchAll(): Promise<Answer> {
    const serviceTypes = await this.serviceTypeService.readAll();
    const answer = {
      status: 1,
      list: serviceTypes,
    };
    return answer;
  }

  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.serviceTypeService.godSearch(
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
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.serviceTypeService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @Put('update')
  async update(@Body() body: any) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<ServiceType> = await this.serviceTypeService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      serviceType: updated,
    };
    return answer;
  }
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.serviceTypeService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      serviceType: deleted,
    };
    return answer;
  }
  @Post('multiDelete')
  async multiDelete(@Body() body: any) {
    const data = await this.serviceTypeService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
