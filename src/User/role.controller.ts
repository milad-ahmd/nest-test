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
import { RoleService } from './services/role.service';
import { Role } from './model/role';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from './model/privilege.enum';

interface Answer {
  status: number;
  count?: number;
  role?: Partial<Role>;
  list?: any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Role>;
    ors?: Partial<Role>;
  };
  sortBy?: object;
}

@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Privilege.ROLE)
  @Post('create')
  async create(@Body() body: any): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newRole: Role = await this.roleService.create(body);
      const answer = {
        status: 1,
        role: newRole,
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
  @Roles(Privilege.ROLE)
  @Get()
  async fetchAll(): Promise<Answer> {
    const roles = await this.roleService.readAll();
    const answer = {
      status: 1,
      list: roles,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.ROLE)
  @Get(':province')
  async fetchByProvince(@Param('province') province: string): Promise<Answer> {
    const provinces = await this.roleService.readByProvince(province);
    const answer = {
      status: 1,
      list: provinces,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.ROLE)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.roleService.godSearch(
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
  @Roles(Privilege.ROLE)
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.roleService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.ROLE)
  @Put('update')
  async update(@Body() body: any) {
    const { _id, ...restOfBody } = body;

    const updated: Partial<Role> = await this.roleService.update(_id, {
      ...restOfBody,
    });
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      role: updated,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.ROLE)
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.roleService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      role: deleted,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.ROLE)
  @Post('multiDelete')
  async multiDelete(@Body() body: any) {
    const data = await this.roleService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
