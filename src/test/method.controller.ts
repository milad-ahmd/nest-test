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
import { MethodService } from './services/method.service';
import { List } from './services/method.service';
import { MethodDto } from './dto/method.dto';
import { Method } from './model/method.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface Answer {
  status: number;
  count?: number;
  method?: Partial<Method>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Method>;
    ors?: Partial<Method>;
  };
  sortBy?: object;
}

@Controller('method')
export class MethodController {
  constructor(private methodService: MethodService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.METHOD)
  @Post('create')
  async create(@Body() body: MethodDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newMethod: Method = await this.methodService.create(body);
      const answer = {
        status: 1,
        method: newMethod,
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
  @Roles(Privilege.METHOD)
  @Get()
  async fetchAll(): Promise<Answer> {
    const methods = await this.methodService.readAll();
    const answer = {
      status: 1,
      list: methods,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.METHOD)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.methodService.godSearch(
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
  @Roles(Privilege.METHOD)
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.methodService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.METHOD)
  @Put('update')
  async update(@Body() body: MethodDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Method> = await this.methodService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      method: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.METHOD)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.methodService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      method: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.METHOD)
  @Post('delMethods')
  async delCompanies(@Body() body: MethodDto) {
    const data = await this.methodService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
