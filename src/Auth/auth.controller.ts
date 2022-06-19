import {
  Param,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { Privilege } from 'src/User/model/privilege.enum';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { UserService } from 'src/User/services/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('forgetPass')
  @HttpCode(200)
  async forgetPass(@Body() { username }, @Res() res) {
    try {
      const mail = await this.userService.forgetPassService_getMail(username);
      if (mail == 'no user') {
        res.json({
          status: 4,
          message:
            "if you've provided a valid username we did send an E-mail for you",
        });
        return;
      }
      if (mail == 'no mail') {
        res.json({
          status: 3,
          message: 'your username has no attached E-mail',
        });
        return;
      }
      const sendMailAnswer = await this.authService.sendMail(mail);
      const string = mail;
      const leftAtSign = string.split('@')[0];
      const showPart = leftAtSign.substring(0, leftAtSign.length - 3);
      const hidePart = leftAtSign
        .substring(leftAtSign.length - 3)
        .replace(/(.)/g, '*');
      const rightAtSign = string.split('@')[1];
      const encryptedMail = showPart + hidePart + '@' + rightAtSign;
      if (sendMailAnswer) {
        res.json({
          status: 1,
          message:
            "we've send a code to this user, hope you typed your email with no typo",
          mail: encryptedMail,
        });
      } else {
        res.json({
          status: 2,
          message: 'there is a problem with sending mail',
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('forgetPass/:token')
  async forgetPass_checkToken(@Param('token') token: string, @Res() res) {
    const isTokenOk = await this.userService.forgetPassService_check(token);
    if (isTokenOk) {
      res.json({
        status: 1,
        message: "it's ok, we can proceed a password request",
      });
    } else {
      res.json({
        status: 2,
        message:
          'oops! times up, you should request again for a password request',
      });
    }
  }

  @Post('forgetPass/setNewPass')
  async forgetPass_setNewPassword(
    @Body() { username, token, newPass },
    @Res() res,
  ) {
    const isTokenOk = await this.userService.forgetPassService_check(token); // check if token is valid
    if (isTokenOk) {
      // if valid change pass
      const isUserPassChanged =
        await this.userService.forgetPassService_updatePass(username, newPass);
      if (isUserPassChanged)
        res.json({
          status: 1,
          message: 'password changed successfully',
        });
    } else {
      res.json({
        status: 2,
        message: 'token is wrong',
      });
    }
  }

  @Post('sendToken')
  async sendToken(@Body() { phoneNumber }, @Res() res) {
    try {
      const id = await this.authService.sentToken(phoneNumber);

      console.log(phoneNumber);
      console.log(id);
      return res.json(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('findAll')
  async findAll(@Body() { phoneNumber }, @Res() res) {
    try {
      return res.json(await this.authService.findAll());
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('findByMobile')
  async findByMobile(@Body() { phoneNumber }, @Res() res) {
    try {
      return res.json(await this.authService.findByMobile(phoneNumber));
    } catch (error) {
      throw new Error(error);
    }
  }

  @Delete('deleteByMobile')
  async deleteByMobile(@Body() { phoneNumber }, @Res() res) {
    try {
      return res.json(await this.authService.deleteByMobile(phoneNumber));
    } catch (error) {
      throw new Error(error);
    }
  }

  @Delete('deleteById')
  async deleteById(@Body() { id }, @Res() res) {
    try {
      return res.json(await this.authService.deleteById(id));
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('mobileIsVerified')
  async mobileIsVerified(@Body() { phoneNumber }, @Res() res) {
    try {
      return res.json(await this.authService.mobileIsVerified(phoneNumber));
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('codeIsOutDated')
  async codeIsOutDated(@Body() { phoneNumber }, @Res() res) {
    try {
      return res.json(await this.authService.codeIsOutDated(phoneNumber));
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('mobileExists')
  async mobileExist(@Body() { phoneNumber }, @Res() res) {
    try {
      return res.json(await this.authService.mobileExists(phoneNumber));
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('verifyMobile')
  async verifyMobile(@Body() { id, code }, @Res() res) {
    try {
      return res.json(await this.authService.verifyMobile(id, code));
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('codeNeedsToRefresh')
  async codeNeedsToRefresh(@Body() { phoneNumber }, @Res() res) {
    try {
      return res.json(await this.authService.codeNeedsToRefresh(phoneNumber));
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login_local')
  async login_local(@Request() req) {
    return req.user;
  }

  @Post('login')
  async login(@Body() body) {
    console.log('login->auth.controller');
    return this.authService.login(body);
  }

  @Roles(Privilege.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('profile->auth.controller');
    return req.user;
  }
}
