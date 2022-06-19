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
import { CityService } from './services/city.service';
import { List } from './services/city.service';
import { CityDto } from './dto/city.dto';
import { City } from './model/city.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface Answer {
  status: number;
  count?: number;
  city?: Partial<City>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<City>;
    ors?: Partial<City>;
  };
  sortBy?: object;
}

@Controller('city')
export class CityController {
  constructor(private cityService: CityService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() body: CityDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newCity: City = await this.cityService.create(body);
      const answer = {
        status: 1,
        city: newCity,
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
    const citys = await this.cityService.readAll();
    const answer = {
      status: 1,
      list: citys,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Get(':province')
  async fetchByProvince(@Param('province') province: string): Promise<Answer> {
    const provinces = await this.cityService.readByProvince(province);
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
    const godSearchResults: any = await this.cityService.godSearch(
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
    const entity = await this.cityService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard)
  @Put('update')
  async update(@Body() body: CityDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<City> = await this.cityService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      city: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.cityService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      city: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Post('multiDelete')
  async multiDelete(@Body() body: CityDto) {
    const data = await this.cityService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
