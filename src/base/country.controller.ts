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
import { CountryService } from './services/country.service';
import { List } from './services/country.service';
import { CountryDto } from './dto/country.dto';
import { Country } from './model/country.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

interface Answer {
  status: number;
  count?: number;
  country?: Partial<Country>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Country>;
    ors?: Partial<Country>;
  };
  sortBy?: object;
}

@Controller('country')
export class CountryController {
  constructor(private countryService: CountryService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() body: CountryDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newCountry: Country = await this.countryService.create(body);
      const answer = {
        status: 1,
        country: newCountry,
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
    const countrys = await this.countryService.readAll();
    const answer = {
      status: 1,
      list: countrys,
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
    const godSearchResults: any = await this.countryService.godSearch(
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
    const entity = await this.countryService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = {
      data: entity.toJSON(),
      status: 1,
    };
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard)
  @Put('update')
  async update(@Body() body: CountryDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Country> = await this.countryService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      country: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.countryService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      country: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Post('multiDelete')
  async multiDelete(@Body() body: CountryDto) {
    const data = await this.countryService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
