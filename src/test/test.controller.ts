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
import { TestService } from './services/test.service';
import { List } from './services/test.service';
import { TestDto } from './dto/test.dto';
import { Test } from './model/test.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface Answer {
  status: number;
  count?: number;
  company?: Partial<Test>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Test>;
    ors?: Partial<Test>;
  };
  sortBy?: object;
}

@Controller('test')
export class TestController {
  constructor(private testService: TestService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.TEST)
  @Post('create')
  async create(@Body() body: any): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newTest: Test = await this.testService.create(body);
      const answer = {
        status: 1,
        test: newTest,
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
  @Roles(Privilege.TEST)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.testService.godSearch(
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
  @Roles(Privilege.TEST)
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.testService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.TEST)
  @Get('')
  async getAll(@Res() res) {
    const entity = await this.testService.readAll();
    res.json(entity);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.TEST)
  @Put('update')
  async update(@Body() body: any) {
    const { _id, ...restOfBody } = body;
    const updated: Partial<Test> = await this.testService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      test: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.TEST)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.testService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      test: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.TEST)
  @Post('delTests')
  async delCompanies(@Body() body: TestDto) {
    const data = await this.testService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
