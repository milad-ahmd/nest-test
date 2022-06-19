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
import { ProvinceService } from './services/province.service';
import { List } from './services/province.service';
import { ProvinceDto } from './dto/province.dto';
import { Province } from './model/province.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

interface Answer {
  status: number;
  count?: number;
  province?: Partial<Province>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Province>;
    ors?: Partial<Province>;
  };
  sortBy?: object;
}

@Controller('province')
export class ProvinceController {
  constructor(private provinceService: ProvinceService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() body: ProvinceDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newProvince: Province = await this.provinceService.create(body);
      const answer = {
        status: 1,
        province: newProvince,
      };
      return answer;
    } else {
      throw new HttpException(
        'not valid request/not such a user',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async fetchAll(): Promise<Answer> {
    const provinces = await this.provinceService.readAll();
    const answer = {
      status: 1,
      list: provinces,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Get(':country')
  async fetchByCountry(@Param('country') country: string): Promise<Answer> {
    const provinces = await this.provinceService.readByCountry(country);
    const answer = {
      status: 1,
      list: provinces,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.provinceService.godSearch(
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
  @UseGuards(JwtAuthGuard)
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.provinceService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard)
  @Put('update')
  async update(@Body() body: ProvinceDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Province> = await this.provinceService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      province: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.provinceService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      province: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Post('multiDelete')
  async multiDelete(@Body() body: ProvinceDto) {
    const data = await this.provinceService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
