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
import { ContainerService } from './services/container.service';
import { List } from './services/container.service';
import { ContainerDto } from './dto/container.dto';
import { Container } from './model/container.model';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface Answer {
  status: number;
  count?: number;
  container?: Partial<Container>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Container>;
    ors?: Partial<Container>;
  };
  sortBy?: object;
}

@Controller('container')
export class ContainerController {
  constructor(private containerService: ContainerService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.CONTAINER)
  @Post('create')
  async create(@Body() body: ContainerDto): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newContainer: Container = await this.containerService.create(body);
      const answer = {
        status: 1,
        container: newContainer,
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
  @Roles(Privilege.CONTAINER)
  @Get()
  async fetchAll(): Promise<Answer> {
    const containers = await this.containerService.readAll();
    const answer = {
      status: 1,
      list: containers,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.CONTAINER)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.containerService.godSearch(
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
  @Roles(Privilege.CONTAINER)
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.containerService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.CONTAINER)
  @Put('update')
  async update(@Body() body: ContainerDto) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Container> = await this.containerService.update(
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
      container: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.CONTAINER)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.containerService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      container: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.CONTAINER)
  @Post('delContainers')
  async delCompanies(@Body() body: ContainerDto) {
    const data = await this.containerService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
