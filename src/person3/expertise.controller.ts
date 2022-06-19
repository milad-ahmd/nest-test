import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Expertise } from './model/expertise.schema';
import { ExpertiseService } from './expertise.service';
import { ExpertisDto } from './dto/expertise.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface ExpertiseAnswer {
  status: number;
  expertise?: Expertise;
  list?: Expertise[] | any;
  count?: number;
}
interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Expertise>;
    ors?: Partial<Expertise>;
  };
  sortBy?: object;
}

@Controller('expertise')
export class ExpertiseController {
  constructor(private readonly expertiseService: ExpertiseService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.EXPERTISE)
  @Post()
  async create(@Body() expertise: ExpertisDto): Promise<ExpertiseAnswer> {
    const newExpertise = await this.expertiseService.create(expertise);
    const answer = {
      status: 1,
      expertise: newExpertise,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.EXPERTISE)
  @Get()
  async fetchAll(): Promise<ExpertiseAnswer> {
    const expertises = await this.expertiseService.readAll();
    const answer = {
      status: 1,
      list: expertises,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.EXPERTISE)
  @Get('/:id')
  async findById(@Param('id') id): Promise<ExpertiseAnswer> {
    const expertise = await this.expertiseService.readById(id);
    const answer = {
      status: 1,
      expertise: expertise,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.EXPERTISE)
  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() expertise: ExpertisDto,
  ): Promise<ExpertiseAnswer> {
    const updatedExpertise = await this.expertiseService.update(id, expertise);
    const computedStatus = updatedExpertise === null ? 0 : 1;
    const answer = {
      status: computedStatus,
      expertise: updatedExpertise,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.EXPERTISE)
  @Delete('/:id')
  async delete(@Param('id') id): Promise<ExpertiseAnswer> {
    const deletedExpertise = await this.expertiseService.delete(id);
    const computedStatus = deletedExpertise === null ? 0 : 1;
    const answer = {
      status: computedStatus,
      expertise: deletedExpertise,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.EXPERTISE)
  @Post('delExpertises')
  async delExpertises(@Body() body): Promise<ExpertiseAnswer> {
    const deletedExpertises = await this.expertiseService.delExpertises(
      body.listOfIds,
    );
    const answer = {
      status: 1,
      list: deletedExpertises,
    };
    return answer;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.EXPERTISE)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResluts: any = await this.expertiseService.godSearch(
      limit,
      page,
      filters,
      sortBy,
    );
    const answer = {
      status: 1,
      count: godSearchResluts[0].totalCount[0].count,
      list: godSearchResluts[0].paginatedResults,
    };

    return answer;
  }
}
