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
import { GroupingService } from './services/grouping.service';
import { List } from './services/grouping.service';
import { GroupingDto } from './dto/grouping.dto';
import { Grouping } from './model/grouping.model';
import { GroupingType } from './model/entityName.enum';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface Answer {
  status: number;
  count?: number;
  grouping?: Partial<Grouping>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  type?: GroupingType;
  filters?: {
    ands?: Partial<Grouping>;
    ors?: Partial<Grouping>;
  };
  sortBy?: object;
}

@Controller('grouping')
export class GroupingController {
  constructor(private groupingService: GroupingService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.GROUPING)
  @Post('create')
  async create(@Body() body: GroupingDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newGrouping: Grouping = await this.groupingService.create(body);
      const answer = {
        status: 1,
        grouping: newGrouping,
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
  @Roles(Privilege.GROUPING)
  @Get('list/:type')
  async fetchAll(@Param('type') type: string): Promise<Answer> {
    const groupings = await this.groupingService.readAll(type);
    const answer = {
      status: 1,
      list: groupings,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.GROUPING)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, type, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.groupingService.godSearch(
      limit,
      page,
      type,
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
  @Roles(Privilege.GROUPING)
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.groupingService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.GROUPING)
  @Put('update')
  async update(@Body() body: GroupingDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Grouping> = await this.groupingService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      grouping: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.GROUPING)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.groupingService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      grouping: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.GROUPING)
  @Post('delGroupings')
  async delGroupings(@Body() body: GroupingDto) {
    const data = await this.groupingService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
