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
import { CurrencyService } from './services/currency.service';
import { List } from './services/currency.service';
import { CurrencyDto } from './dto/currency.dto';
import { Currency } from './model/currency.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

interface Answer {
  status: number;
  count?: number;
  currency?: Partial<Currency>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Currency>;
    ors?: Partial<Currency>;
  };
  sortBy?: object;
}

@Controller('currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() body: CurrencyDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newCurrency: Currency = await this.currencyService.create(body);
      const answer = {
        status: 1,
        currency: newCurrency,
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
    const currencys = await this.currencyService.readAll();
    const answer = {
      status: 1,
      list: currencys,
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
    const godSearchResults: any = await this.currencyService.godSearch(
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
    const entity = await this.currencyService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard)
  @Put('update')
  async update(@Body() body: CurrencyDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Currency> = await this.currencyService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      currency: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.currencyService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      currency: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard)
  @Post('multiDelete')
  async multiDelete(@Body() body: CurrencyDto) {
    const data = await this.currencyService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
