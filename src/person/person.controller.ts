import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { PersonService } from './person.service';
import { validKeys } from './model/person.model';
import { CreatePersonDto } from './dto/create-person.dto'; 
import { CreateUserDto } from './../User/Dto/create-user.dto'; //TODO: we should delete this

@Controller('person')
export class PersonController {
    constructor (
        private personService: PersonService
    ) {}
    @Post('personExists')
    async personExists (@Body() {key, val}) {
        if (!validKeys.personExists[key]) return {status: 100, message: 'not valid key'};
        return this.personService.readPerson(key, val)
    }
    @Post('createPerson')
    async createPerson (@Body() body: CreateUserDto, @Res() res) {
        let doesBodyValid = true;
        let validKeysForCreate = validKeys.createPerson;
        let keys = Object.keys(body);
        keys.filter((key) => {
            if (!validKeysForCreate[key]) {
                doesBodyValid = false;
            }
        })
        if (doesBodyValid) {
            let newUser = await this.personService.createPerson(body);
            let newUserJson = newUser.toJSON();
            newUserJson['status'] = 1;
            return res.json(newUserJson);
        } else {
            res.json({ status: 100, message: 'not valid request/not such a user'} );
            return;
        }
    }
    @Get(':by/:what')
    async readPerson (@Param('by') by: string, @Param('what') what: string, @Res() res) {
        if (!validKeys.readPerson[by]) return res.json({status: 100, message: 'not valid key'});
        let person = await this.personService.readPerson(by, what);
        if (!person) return res.json({status: 2, message: 'no person found'});
        let userJson = person.toJSON();
        userJson['status'] = 1;
        res.json(userJson);
    }
    @Post('list')
    async list (@Body() {limit, key, val, page, groupingKey, groupingVal}, @Res() res) {
        let persons;
        if (groupingKey) {
            if (!page) persons = await this.personService.list4Grouping(limit, key, val, groupingKey, groupingVal);
            else persons = await this.personService.list4Grouping(limit, key, val, groupingKey, page);
            console.log(persons);
            // let personsJson = JSON.stringify(persons);
            // let personsJson = JSON.parse(persons);
            // console.log(personsJson);
            persons['status'] = 1;
            // return persons;
            res.json(persons);
        } else {
            if (!page) persons = await this.personService.list(limit, key, val);
            else persons = await this.personService.list(limit, key, val, page);
            if (persons.length <= 0) {
                res.json({status: 2, message: 'no user found'});
                return;
            }
            let personsJson = JSON.stringify(persons);
            personsJson = JSON.parse(personsJson);
            personsJson['status'] = 1;
            res.json(personsJson);
        }
    }
    @Post('updatePerson')
    async updatePerson (@Body() body, @Res() res) {
        let updatedPerson: any = false;
        let validKeysForUpdate = validKeys.updatePerson;
        if (validKeysForUpdate[body.wherekey]) {
            updatedPerson = await this.personService.updatePerson(body.wherekey, body.whereval, body);
        }
        if (!updatedPerson) {
            res.json({ status: 100, message: 'not valid request/not such a user'} );
            return;
        }
        res.json({
            status: 1,
            updatedPerson: updatedPerson
        })
    }
    @Post('delPerson')
    async delPerson (@Body() body, @Res() res) {
        let deletedPerson: any = false;
        let validKeysForDelete = validKeys.delPerson;
        if (validKeysForDelete[body.wherekey]) {
            deletedPerson = await this.personService.delPerson(body.wherekey, body.whereval);
        }
        if (!deletedPerson) {
            res.json({ status: 100, message: 'not valid request/not such a user'} );
            return;
        }
        res.json({
            status: 1,
            updatedPerson: deletedPerson
        })
    }
    @Post('search')
    async search (@Body() {keys, searchText, wherekey, whereval}, @Res() res) {
        let doesKeysValid = true;
        let validKeysForSearch = validKeys.search;
        keys.filter((key) => {
            if (!validKeysForSearch[key]) {
                doesKeysValid = false;
            }
        })
        if (doesKeysValid) {
            const searchResults = await this.personService.search(keys, searchText, wherekey, whereval);
            res.json({
                status: 1,
                results: searchResults
            })
        } else {
            res.json({ status: 100, message: 'not valid request/not such a user'} );
            return;
        }
    }
    @Post('searchWithConds')
    async searchWithConds (@Body() {andKeys, orKeys, wherekey, whereval, limit, page}, @Res() res) {
        let doesKeysValid = true;
        // let validKeysForSearch = validKeys.searchWithConds;
        // if (andKeys) {
        //     andKeys.filter((key) => {
        //         key = key[0];
        //         if (!validKeysForSearch[key]) {
        //             doesKeysValid = false;
        //         }
        //     })
        // }
        // if (orKeys) {
        //     orKeys.filter((key) => {
        //         key = key[0];
        //         if (!validKeysForSearch[key]) {
        //             doesKeysValid = false;
        //         }
        //     })
        // }
        // if (!validKeysForSearch[wherekey]) {
        //     doesKeysValid = false;
        // }
        if (doesKeysValid) {
            const searchResults = await this.personService.searchWithConds(andKeys, orKeys, wherekey, whereval, limit, page);
            res.json({
                status: 1,
                count: searchResults.count,
                results: searchResults.results,
            })
        } else {
            res.json({ status: 100, message: 'not valid request/not such a user'} );
            return;
        }
    }
    @Get('getCountries')
    async getCountries () {
        let countries = await this.personService.getCountries().toPromise();
        countries.data['IR'] = {country: "Iran", region: "Asia"};
        return countries;
    }
    @Post('getCities')
    async getCities (@Body() {country}) {
        console.log('hell');
        let cities = await this.personService.getCities(country).toPromise();
        console.log(cities);
        return cities;
    }
}
