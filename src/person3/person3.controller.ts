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
  UseGuards,
} from '@nestjs/common';
import { List, Person3Service } from './person3.service';
import { Person3, validKeysForPersonHandlers } from './model/person3.model';
import { PersonDto } from './dto/person.dto';
import { ErrorType } from '../global/models/error.model';
import { EntityName } from './model/entityName.enum';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { RolesGuard } from '../Auth/guards/roles.guard';
import { Roles } from '../Auth/decorators/roles.decorator';
import { Privilege } from '../User/model/privilege.enum';

interface PersonAnswer {
  status: number;
  count?: number;
  person?: Partial<Person3>;
  list?: List | any;
}
interface GodSearch {
  limit: number;
  page: number;
  entityName?: EntityName;
  filters?: {
    ands?: Partial<Person3>;
    ors?: Partial<Person3>;
  };
  sortBy?: object;
}

@Controller('person3')
export class PersonController {
  constructor(private personService: Person3Service) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('personExists')
  async personExists(@Body() { key, val }) {
    if (!validKeysForPersonHandlers.personExists[key])
      return {
        status: 100,
        message: 'not valid key',
      };
    return this.personService.readPerson(key, val);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('createPerson')
  async createPerson(
    @Body() body: PersonDto,
  ): Promise<PersonAnswer | ErrorType> {
    let doesBodyValid = true;
    const validKeysForCreate: string[] =
      validKeysForPersonHandlers.createPerson;
    const keys = Object.keys(body);
    // check if body has unwanted additional options
    keys.filter((key) => {
      if (!validKeysForCreate.includes(key)) {
        doesBodyValid = false;
      }
    });
    // // check if we have all of the required options for createPerson
    // validKeysForCreate.forEach((item: string) => {
    //     if (!body[item]) {
    //         doesBodyValid = false;
    //         console.log('by');
    //         console.log(body[item]);
    //     }
    // })
    if (doesBodyValid) {
      const newUser: Person3 = await this.personService.createPerson(body);
      const answer = {
        status: 1,
        person: newUser,
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
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Get(':by/:what')
  async readPerson(
    @Param('by') by: string,
    @Param('what') what: string,
  ): Promise<PersonAnswer | ErrorType> {
    // check if :by is a valid request, for now it's just _id
    const isByValid = true;
    // let isByValid = false;
    // validKeysForPersonHandlers.readPerson.filter((valid_by) => {
    //     if (valid_by == by) isByValid = true;
    // })
    if (!isByValid)
      throw new HttpException(
        'not valid request',
        HttpStatus.PRECONDITION_FAILED,
      );
    const person = await this.personService.readPerson(by, what);
    if (!person)
      throw new HttpException('not such a user', HttpStatus.NOT_FOUND);
    const answer = {
      status: 1,
      person,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('list')
  async list(@Body() body: PersonDto): Promise<PersonAnswer | ErrorType> {
    // eslint-disable-next-line prefer-const
    let { mode, limit, page, entityName, groupingKey, groupingVal } = body;
    // check if we have not all of the required options for list
    const doesBodyValid = true;
    const validKeysForCreate: string[] = validKeysForPersonHandlers.listPersons;
    // validKeysForCreate.forEach((item: string) => {
    //     if (!body[item]) {
    //         doesBodyValid = false;
    //     }
    // })

    let returnedList: List;
    if (doesBodyValid) {
      if (!page) page = 1;
      if (mode === 'all&count') {
        returnedList = await this.personService.list(limit, page, entityName);
      } else if (mode === 'grouping&all&count') {
        returnedList = await this.personService.list(
          limit,
          page,
          entityName,
          groupingKey,
          groupingVal,
        );
      }
      const answer = {
        status: 1,
        list: returnedList,
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
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('groupList')
  async groupList(@Body() body: PersonDto) {
    const { entityName, groupingKey, limit, page } = body;
    const groupedPersons = await this.personService.groupList(
      entityName,
      groupingKey,
      limit,
      page,
    );
    const answer = {
      status: 1,
      list: groupedPersons,
    };

    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('godSearch')
  async godSearch(@Body() body: GodSearch) {
    const { limit, page, entityName, filters, sortBy } = body;
    if (!limit || !page)
      throw new HttpException(
        'limit and page are required for this functionality',
        HttpStatus.PRECONDITION_FAILED,
      );
    const godSearchResluts: any = await this.personService.godSearch(
      limit,
      page,
      entityName,
      filters,
      sortBy,
    );
    const answer = {
      status: 1,
      count:
        godSearchResluts[0] && godSearchResluts[0].totalCount[0]
          ? godSearchResluts[0].totalCount[0].count
          : 0,
      list: godSearchResluts[0].paginatedResults,
    };

    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Put('updatePerson')
  async updatePerson(
    @Body() body: PersonDto,
  ): Promise<PersonAnswer | ErrorType> {
    // check if we have not unwanted
    const { _id, ...restOfBody } = body;
    const updatedPerson: Partial<Person3> =
      await this.personService.updatePerson(_id, restOfBody);
    if (!updatedPerson)
      throw new HttpException(
        'maybe your id is fake',
        HttpStatus.PRECONDITION_FAILED,
      );
    const answer = {
      status: 1,
      person: updatedPerson,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Delete('delPerson/:id')
  async delPerson(@Param('id') id: string): Promise<PersonAnswer> {
    let deletedPerson: Partial<Person3>;
    // check if we have all of the required options for updatePerson
    const doesBodyValid = true;
    const validKeysForDelete = validKeysForPersonHandlers.delPerson;
    // validKeysForDelete.forEach((item: string) => {
    //     if (!body[item]) {
    //         doesBodyValid = false;
    //     }
    // })
    if (doesBodyValid) {
      deletedPerson = await this.personService.delPerson(id);
    }
    if (deletedPerson === null) {
      deletedPerson = {};
      deletedPerson['status'] = 0;
    }
    const answer = {
      status: 1,
      person: deletedPerson,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('delPersons')
  async delPersons(@Body() body: PersonDto): Promise<PersonAnswer> {
    let deletedPersons;
    // check if we have _id
    const doesBodyValid = true;
    const validKeysForDelete = validKeysForPersonHandlers.delPersons;
    // validKeysForDelete.forEach((item: string) => {
    //     if (!body[item]) {
    //         doesBodyValid = false;
    //     }
    // })
    if (doesBodyValid) {
      deletedPersons = await this.personService.delPersons(body.listOfIds);
    }
    console.log(deletedPersons);
    if (deletedPersons.length == 0) {
      deletedPersons['status'] = 0;
    } else {
      deletedPersons['status'] = 1;
    }
    const answer = {
      status: 1,
      list: deletedPersons,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('search')
  async search(@Body() body): Promise<PersonAnswer | ErrorType> {
    const { keys, searchText, entityName } = body;
    let doesKeysValid = true;
    const doesBodyvalid = true;
    const validKeysForSearch = validKeysForPersonHandlers.search;
    const validKeysForSearch2 = validKeysForPersonHandlers.search2;
    keys.forEach((key) => {
      if (!validKeysForSearch.includes(key)) {
        doesKeysValid = false;
      }
    });
    //check if body has all of the required things:
    const bodyKeys = Object.keys(body);
    // validKeysForSearch2.filter((requiredKeyForSearch) => {
    //     if (!bodyKeys.includes(requiredKeyForSearch)) {
    //         doesBodyvalid = false;
    //     }
    // })
    if (!doesBodyvalid) {
      throw new HttpException(
        'you should fulfill all of the required fields of this api',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    if (doesKeysValid) {
      const searchResults = await this.personService.search(
        keys,
        searchText,
        entityName,
      );
      const answer = {
        status: 1,
        list: searchResults,
      };
      return answer;
    } else {
      throw new HttpException(
        'the keys you provided are not valid',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Post('searchWithConds')
  async searchWithConds(
    @Body() body: PersonDto,
  ): Promise<PersonAnswer | ErrorType> {
    const { andKeys, orKeys, entityName, limit, page } = body;
    let doesKeysValid = true;
    let doesBodyValid = true;
    const validKeysForSearchWithCondsAnds =
      validKeysForPersonHandlers.searchWithCondsAnds;
    const validKeysForsearchWithCondsOrs =
      validKeysForPersonHandlers.searchWithCondsOrs;
    const validKeysForSsearchWithCondsMainKeys =
      validKeysForPersonHandlers.searchWithCondsMainKeys;
    if (andKeys) {
      andKeys.filter((key) => {
        key = key[0];
        if (!validKeysForSearchWithCondsAnds.includes(key)) {
          doesKeysValid = false;
          console.log('this is dastan');
          console.log(`${key}`);
        }
      });
    }
    if (orKeys) {
      orKeys.filter((key) => {
        key = key[0];
        if (!validKeysForsearchWithCondsOrs.includes(key)) {
          doesKeysValid = false;
          console.log('this is dastan');
          console.log(`${key}`);
        }
      });
    }
    const bodyKeys = Object.keys(body);
    bodyKeys.forEach((bodyKey) => {
      if (!validKeysForSsearchWithCondsMainKeys.includes(bodyKey)) {
        doesBodyValid = false;
        console.log('this is dastan');
        console.log(`${bodyKey}`);
      }
    });
    if (!doesBodyValid) {
      throw new HttpException(
        "you have things in your body that you shouldn'nt!! ",
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    if (doesKeysValid) {
      const searchResults = await this.personService.searchWithConds(
        andKeys,
        orKeys,
        entityName,
        limit,
        page,
      );
      const answer = {
        status: 1,
        list: searchResults,
      };
      return answer;
    } else {
      throw new HttpException(
        'the keys you provided are not valid',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }

  // this is just one time invoking API
  // @Get('createStates')
  // async createStates() {
  //   await this.personService.createStates();
  // }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Get('states')
  async getStates() {
    const countries = await this.personService.getStates();
    const answer = {
      status: 1,
      list: countries,
    };
    return answer;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Privilege.CONTACTS,
    Privilege.DENTISTS,
    Privilege.DOCTORS,
    Privilege.PERSONNEL,
    Privilege.PERSONS,
  )
  @Get('gis/cities/:stateFars')
  async getCities(@Param('stateFars') stateFars: string) {
    // return 'this is meee';
    // console.log('I Am hereeeeeeeeeeeeeeeee');
    const cities = await this.personService.getCities(stateFars);
    const answer = {
      status: 1,
      list: cities,
    };
    return cities;
  }
}
