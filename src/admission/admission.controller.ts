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
  Query,
} from '@nestjs/common';
import { AdmissionService } from './services/admission.service';
import { List } from './services/admission.service';
import { AdmissionDto } from './dto/admission.dto';
import { Admission } from './model/admission.model';
import { AxiosResponse } from 'axios';

interface Answer {
  status: number;
  count?: number;
  company?: Partial<Admission>;
  list?: List | any;
}

interface GodSearch {
  limit: number;
  page: number;
  filters?: {
    ands?: Partial<Admission>;
    ors?: Partial<Admission>;
  };
  sortBy?: object;
}

@Controller('admission')
export class AdmissionController {
  constructor(private admissionService: AdmissionService) {}
  @Post('create')
  async create(@Body() body: any): Promise<Answer> {
    const doesBodyValid = true;
    if (doesBodyValid) {
      const newAdmission: Admission = await this.admissionService.create(body);
      const answer = {
        status: 1,
        admission: newAdmission,
      };
      return answer;
    } else {
      throw new HttpException(
        'not valid request/not such a user',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResults: any = await this.admissionService.godSearch(
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
  @Post('test-service')
  async testAndServiceSearch(@Body() body: any) {
    const { company, term } = body;
    const result: any = await this.admissionService.testAndService(
      company,
      term,
    );
    const answer = {
      status: 1,
      list: result,
    };
    return answer;
  }
  @Get('import-data')
  async importData() {
    const result: any = await this.admissionService.importData();
    const answer = {
      status: 1,
      list: result,
    };
    return answer;
  }
  @Get('convert-name-family')
  async convertNameAndFamily(@Query('q') q: string, @Res() res) {
    if (!q) return res.json({ status: 2, message: 'no name to convert' });
    this.admissionService
      .convertNameAndFamily(q)
      .subscribe((result: AxiosResponse<any>) => {
        if (!result) return res.json({ status: 2, message: 'no result found' });
        res.json({ data: result.data });
      });
  }
  @Get('gender-of-name')
  async genderOfName(@Query('q') q: string, @Res() res) {
    if (!q) return res.json({ status: 2, message: 'no name to convert' });
    this.admissionService
      .genderOfName(q)
      .subscribe((result: AxiosResponse<any>) => {
        if (!result) return res.json({ status: 2, message: 'no result found' });
        res.json({ data: result.data });
      });

  }
  @Get(':by/:what')
  async read(@Param('by') by: string, @Param('what') what: string, @Res() res) {
    const entity = await this.admissionService.read(by, what);
    if (!entity) return res.json({ status: 2, message: 'no entity found' });
    const userJson = entity.toJSON();
    res.json(userJson);
  }
  @Get('')
  async getAll(@Res() res) {
    const entity = await this.admissionService.readAll();
    res.json(entity);
  }
  @Put('update')
  async update(@Body() body: any) {
    const { _id, ...restOfBody } = body;
    const updated: Partial<Admission> = await this.admissionService.update(
      _id,
      {
        ...restOfBody,
        isTemp: false,
      },
    );
    console.log(updated);
    if (!updated)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      admission: updated,
    };
    return answer;
  }
  @Delete('del/:id')
  async del(@Param('id') id: string) {
    let deleted: any = await this.admissionService.deleteById(id);
    if (deleted === null) {
      deleted = {};
      deleted['status'] = 0;
    }
    const answer = {
      status: 1,
      admission: deleted,
    };
    return answer;
  }
  @Post('delAdmissions')
  async delCompanies(@Body() body: AdmissionDto) {
    const data = await this.admissionService.deleteEntities(body.listOfIds);
    const answer = {
      status: 1,
      ...data,
    };
    return answer;
  }
}
