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
import { PriceListService } from './services/priceList.service';
import { List } from './services/priceList.service';
import { PriceList } from './model/priceList.model';

interface Answer {
  status: number;
  count?: number;
  priceList?: Partial<PriceList>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<PriceList>;
    ors?: Partial<PriceList>;
  };
  sortBy?: object;
}

@Controller('priceList')
export class PriceListController {
  constructor(private priceListService: PriceListService) {}
  @Post('create')
  async create(@Body() body: any): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newPriceList: PriceList = await this.priceListService.create(body);
      const answer = {
        status: 1,
        priceList: newPriceList,
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
    const priceLists = await this.priceListService.readAll();
    const answer = {
      status: 1,
      list: priceLists,
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
    const godSearchResults: any = await this.priceListService.godSearch(
      limit,
      page,
      filters,
      sortBy,
    );
    const answer = {
      status: 1,
      count: godSearchResults.count,
      list: godSearchResults.list,
    };
    return answer;
  }
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.priceListService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @Put('update')
  async update(@Body() body: any) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<PriceList> = await this.priceListService.update(
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
      priceList: updated,
    };
    return answer;
  }
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.priceListService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      priceList: deleted,
    };
    return answer;
  }
  @Post('multiDelete')
  async multiDelete(@Body() body: any) {
    const data = await this.priceListService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
