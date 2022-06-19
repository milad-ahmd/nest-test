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
import { CompanyService } from './company.service';
import { Company, validKeys } from './model/company.model';
import { Section } from './model/section.model';
import { List } from './company.service';
import { CompanyEntityName } from './model/entityName.enum';
import { CompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface CompanyAnswer {
  status: number;
  count?: number;
  company?: Partial<Company>;
  section?: Partial<Section>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  entityName?: CompanyEntityName;
  filters?: {
    ands?: Partial<Company>;
    ors?: Partial<Company>;
  };
  sortBy?: object;
}

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Post('createCompany')
  async createCompany(@Body() body: CompanyDto): Promise<CompanyAnswer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newCompany: Company = await this.companyService.createCompany(body);
      const answer = {
        status: 1,
        company: newCompany,
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
  @Roles(Privilege.COMPANIES)
  @Get('getPersonsBySection/:id')
  async getPersonsBySection(@Param('id') id: string) {
    const companies = await this.companyService.getPersonsBySection(id);
    const answer = {
      status: 1,
      list: companies,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Post('addSection')
  async addSection(@Body() body) {
    const createdSection = await this.companyService.addSection(body);
    const answer = {
      status: 1,
      Section: createdSection,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Delete('deleteSection/:id')
  async deleteSection(@Param('id') id: string) {
    const createdSection = await this.companyService.delSection(id);
    const answer = {
      status: 1,
      Section: createdSection,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Put('updateSection')
  async updateSection(@Body() body) {
    const { _id, ...restOfBody } = body;
    const createdSection = await this.companyService.updateSection(
      _id,
      restOfBody,
    );
    const answer = {
      status: 1,
      Section: createdSection,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, entityName, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.companyService.godSearch(
      limit,
      page,
      entityName,
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
  @Roles(Privilege.COMPANIES)
  @Get('getAllCompaniesTypes')
  async getAllCompaniesTypes() {
    const allCompaniesTypes = await this.companyService.getAllCompaniesTypes();
    const answer = {
      status: 1,
      list: allCompaniesTypes,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Get('getLabContactTypes')
  async getLabContactTypes() {
    const allCompaniesTypes = await this.companyService.getAllCompaniesTypes();
    const answer = {
      status: 1,
      list: allCompaniesTypes,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Get('getLabSections/:labId')
  async getLabSections(@Param('labId') labId: string) {
    const companies = await this.companyService.getLabSections(labId);
    const answer = {
      status: 1,
      list: companies,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Get('getLabPersons/:companyId')
  async getLabPersons(@Param('companyId') id: string) {
    const companies = await this.companyService.getLabPersons(id);
    const answer = {
      status: 1,
      list: companies,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Get(':by/:what')
  async readCompany(
    @Param('by') by: string,
    @Param('what') what: string,
    @Res() res,
  ) {
    if (!validKeys.readCompany[by])
      return res.json({ status: 100, message: 'not valid key' });
    const company = await this.companyService.readCompany(by, what);
    if (!company) return res.json({ status: 2, message: 'no company found' });
    const userJson = company.toJSON();
    userJson['status'] = 1;
    res.json(userJson);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Put('updateCompany')
  async updateCompany(@Body() body: CompanyDto) {
    const { _id, ...restOfBody } = body;

    const updatedCompany: Partial<Company> =
      await this.companyService.updateCompany(_id, {
        ...restOfBody,
        isTemp: false,
      });
    if (!updatedCompany)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      company: updatedCompany,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Delete('delCompany/:id')
  async delCompany(@Param('id') id: string) {
    let deletedCompany: any = await this.companyService.delCompany(id);
    if (deletedCompany === null) {
      deletedCompany = {};
      deletedCompany['status'] = 0;
    }
    const answer = {
      status: 1,
      person: deletedCompany,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.COMPANIES)
  @Post('delCompanies')
  async delCompanies(@Body() body: CompanyDto) {
    const data = await this.companyService.delCompanies(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
