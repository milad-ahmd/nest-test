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
import { NationalityService } from './services/nationality.service';
import { List } from './services/nationality.service';
import { NationalityDto } from './dto/nationality.dto';
import { Nationality } from './model/nationality.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

interface Answer {
  status: number;
  count?: number;
  nationality?: Partial<Nationality>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Nationality>;
    ors?: Partial<Nationality>;
  };
  sortBy?: object;
}

@Controller('nationality')
export class NationalityController {
  constructor(private nationalityService: NationalityService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() body: NationalityDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newNationality: Nationality = await this.nationalityService.create(
        body,
      );
      const answer = {
        status: 1,
        nationality: newNationality,
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
    const nationalitys = await this.nationalityService.readAll();
    const answer = {
      status: 1,
      list: nationalitys,
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
    const godSearchResults: any = await this.nationalityService.godSearch(
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
    const entity = await this.nationalityService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard)
  @Put('update')
  async update(@Body() body: NationalityDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Nationality> = await this.nationalityService.update(
      _id,
      {
        ...restOfBody,
      },
    );
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      nationality: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.nationalityService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      nationality: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Post('multiDelete')
  async multiDelete(@Body() body: NationalityDto) {
    const data = await this.nationalityService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
