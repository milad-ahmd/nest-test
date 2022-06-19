import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { User } from './model/user';
import { UserInput } from './user.input';
import { UserService } from './services/user.service';
import { Roles } from 'src/Auth/decorators/roles.decorator';
import { Privilege } from './model/privilege.enum';
import { RolesGuard } from '../Auth/guards/roles.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('createUser')
  async createUser(
    @Body()
    {
      name,
      family,
      username,
      password,
      mobile,
      mail,
      forgetPassToken,
      forgetPassTs,
      roles,
    },
  ) {
    try {
      const userInput = new UserInput();
      userInput.username = username;
      userInput.password = password;
      userInput.mobile = mobile;
      userInput.name = name;
      userInput.family = family;
      userInput.roles = roles;
      userInput.forgetPassToken = forgetPassToken;
      userInput.forgetPassTs = forgetPassTs;
      userInput.mail = mail;
      const result = await this.userService.createUserResolver(userInput);
      const newUser = await this.userService.findOne(userInput.username);
      return { ...result, data: newUser };
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.USER)
  @Get('findAll')
  async findAll() {
    try {
      return await this.userService.findAll();
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.USER)
  @Delete('deleteByUsername')
  async deleteByMobile(@Body() { username }, @Res() res) {
    try {
      return res.json(await this.userService.deleteByUsername(username));
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Privilege.USER)
  @Patch('updateUser')
  async updateUser(
    @Body() { name, family, username, password, mobile, mail, roles },
  ) {
    console.log('updateUser->user.controller');
    try {
      const userInput = new UserInput();
      userInput.username = username;
      userInput.password = password;
      userInput.mobile = mobile;
      userInput.name = name;
      userInput.family = family;
      userInput.mail = mail;
      userInput.roles = roles;
      await this.userService.updateUserResolver(userInput);
      const newUser: User = await this.userService.findOne(userInput.username);
      return newUser;
    } catch (error) {
      throw new Error(error);
    }
  }
}
