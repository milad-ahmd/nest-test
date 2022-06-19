import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthInput, DeleteInput, LoginInput, VerifyInput } from './auth.input';
import { Auth } from './model/auth';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/User/services/user.service';
import * as bcrypt from 'bcrypt';
import { jwtConstants_access, jwtConstants_refresh } from './constants';
import { sign } from 'jsonwebtoken';
const nodemailer = require('nodemailer');
// const generator = require('generate-password');

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Auth') private readonly authModel: Model<Auth>,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  private currentForgetPassToken = '';
  forgetPassTokenGenerator() {
    const forgetPassToken = Math.floor(Math.random() * 90000) + 10000;
    return forgetPassToken.toString();
  }

  async sendMail(mail: string) {
    this.currentForgetPassToken = this.forgetPassTokenGenerator();

    const mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'booda.nabooda.01@gmail.com',
        pass: 'a1a9s1s9',
      },
    });

    const mailDetails = {
      from: 'colifeSupport@colife.com',
      to: mail,
      subject: 'colife support, password recovery',
      html: `
            <b>welcome</b><br>
            <p>we've got your request to reset your password</p>
            <p>if it wasn't from you please just ignore this email</p>
            <p>your code is:</p>
            <span style="color: red;font-size: 2rem">${this.currentForgetPassToken}</span>
            `,
    };

    await mailTransporter.sendMail(mailDetails);
    console.log('forget pass mail has been sent');
    // does a user with this email exists?
    // if yes add a token with 5 min expiration date to it
    const userExists = this.userService.userExistsByMail(mail);
    if (userExists) {
      this.addForgetPassToken(mail, this.currentForgetPassToken);
    } else {
      console.log('we dont have this user');
    }
    return true;
  }
  async addForgetPassToken(mail, forgetPassToken) {
    await this.userService.forgetPassService_add(mail, forgetPassToken);
  }
  async sentToken(phoneNumber: string): Promise<string> {
    if (!(await this.mobileExists(phoneNumber))) {
      const auth = await this.authModel.create({ mobile: phoneNumber });
      console.log(auth.code);
      return auth._id;
    } else if (await this.mobileExists(phoneNumber)) {
      if ((await this.mobileIsVerified(phoneNumber)) == true) {
        return 'موبایل تایید شده است';
      } else {
        if (await this.codeNeedsToRefresh(phoneNumber)) {
          const auth2 = await this.authModel.create({ mobile: phoneNumber });
          console.log(auth2.code);
          return auth2._id;
        } else return 'کد ارسال شده هنوز منقضی نشده است';
      }
    }
  }

  async findAll(): Promise<Auth[]> {
    const auth = await this.authModel.find().exec();
    return auth;
  }

  async findByMobile(mobile: string): Promise<Auth[]> {
    const auth = await this.authModel.find({ mobile: mobile }).exec();

    return auth;
  }

  async mobileExists(mobile: string): Promise<boolean> {
    const auth = await this.authModel.find({ mobile: mobile }).exec();

    if (auth.length > 0) return true;
    else return false;
  }

  async mobileIsVerified(mobile: string): Promise<boolean> {
    const auth = await this.authModel
      .find({ mobile: mobile, isVerified: true })
      .exec();

    if (auth.length > 0) return true;
    else return false;
  }

  async IsVerified(id: string): Promise<boolean> {
    const auth = await this.authModel
      .find({ _id: id, isVerified: true })
      .exec();

    if (auth.length > 0) return true;
    else return false;
  }

  async codeIsOutDated(mobile: string): Promise<boolean> {
    const auth = await this.authModel
      .find({
        mobile: mobile,
        isVerified: false,
        expireDate: {
          $gte: new Date(),
        },
        createDate: { $lte: new Date() },
      })
      .exec();

    if (auth.length == 0) return true;
    else return false;
  }

  async deleteByMobile(mobile: string): Promise<boolean> {
    const auth = await this.authModel
      .findOneAndDelete({ mobile: mobile })
      .exec();

    if ((await this.mobileExists(mobile)) == true) return false;
    else return true;
  }

  async codeNeedsToRefresh(mobile: string): Promise<boolean> {
    const auth = await this.authModel
      .find({
        mobile: mobile,
        isVerified: false,
        expireDate: {
          $gte: new Date(),
        },
        createDate: { $lte: new Date() },
      })
      .exec();

    if (auth.length == 0) return true;
    else return false;
  }

  async deleteById(id: string): Promise<boolean> {
    const auth = await this.authModel.findByIdAndDelete(id).exec();

    const authRemain = await this.authModel.find({ _id: id }).exec();

    if (authRemain.length > 0) return false;
    else return true;
  }

  async verifyMobile(id: string, code: string): Promise<boolean> {
    const auth = await this.authModel.find({ _id: id }).exec();
    if (auth.length > 0) {
      if ((await this.IsVerified(id)) == false) {
        const auth2 = await this.authModel
          .find({ _id: id, isVerified: false, code: code })
          .exec();

        if (auth2.length > 0) {
          const auth3 = await this.authModel
            .find({
              _id: id,
              isVerified: false,
              expireDate: {
                $gte: new Date(),
              },
              createDate: { $lte: new Date() },
              code: code,
            })
            .exec();

          if (auth3.length > 0) {
            console.log('Verifying code ...');

            const filter = { _id: id };
            const update = { isVerified: true };

            const doc = await this.authModel.findOneAndUpdate(filter, update);
            await doc.save();

            return true;
          } else {
            console.log('Outdated code!');
            return false;
          }
        } else {
          console.log('Wrong code!');
          return false;
        }
      } else {
        console.log('Is verified before!');
        return false;
      }
    } else {
      console.log('No such record!');
      return false;
    }
  }

  async sentTokenResolver(authInput: AuthInput): Promise<string> {
    console.log(2);

    if (!(await this.mobileExists(authInput.mobile))) {
      console.log(3);
      const auth = await this.authModel.create({ mobile: authInput.mobile });
      console.log(auth.code);
      return auth._id;
    } else if (await this.mobileExists(authInput.mobile)) {
      console.log(4);
      if ((await this.mobileIsVerified(authInput.mobile)) == true) {
        console.log(5);
        return 'موبایل تایید شده است';
      } else {
        console.log(6);
        if (await this.codeNeedsToRefresh(authInput.mobile)) {
          console.log(7);
          const auth2 = await this.authModel.create({
            mobile: authInput.mobile,
          });
          console.log(auth2.code);
          console.log(auth2._id);
          return auth2._id;
        } else {
          console.log(8);
          return 'کد ارسال شده هنوز منقضی نشده است';
        }
      }
    }
  }

  async findAllResolver(): Promise<Auth[]> {
    const auth = await this.authModel.find().exec();
    return auth;
  }

  async verifyMobileResolver(verifyInput: VerifyInput): Promise<boolean> {
    const auth = await this.authModel.find({ _id: verifyInput.id }).exec();
    if (auth.length > 0) {
      if ((await this.IsVerified(verifyInput.id)) == false) {
        const auth2 = await this.authModel
          .find({
            _id: verifyInput.id,
            isVerified: false,
            code: verifyInput.code,
          })
          .exec();

        if (auth2.length > 0) {
          const auth3 = await this.authModel
            .find({
              _id: verifyInput.id,
              isVerified: false,
              expireDate: {
                $gte: new Date(),
              },
              createDate: { $lte: new Date() },
              code: verifyInput.code,
            })
            .exec();

          if (auth3.length > 0) {
            console.log('Verifying code ...');

            const filter = { _id: verifyInput.id };
            const update = { isVerified: true };

            const doc = await this.authModel.findOneAndUpdate(filter, update);
            await doc.save();

            return true;
          } else {
            console.log('Outdated code!');
            return false;
          }
        } else {
          console.log('Wrong code!');
          return false;
        }
      } else {
        console.log('Is verified before!');
        return false;
      }
    } else {
      console.log('No such record!');
      return false;
    }
  }

  async deleteByIdResolver(deleteInput: DeleteInput): Promise<boolean> {
    const auth = await this.authModel.findByIdAndDelete(deleteInput.id).exec();

    const authRemain = await this.authModel
      .find({ _id: deleteInput.id })
      .exec();

    if (authRemain.length > 0) return false;
    else return true;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;

      return true;
    }
    return false;
  }

  async login(loginInput: LoginInput) {
    if (await this.validateUser(loginInput.username, loginInput.password)) {
      const user2 = await this.userService.findOne(loginInput.username);
      const privileges = [];
      for (const item of user2.roles) {
        for (const sub of item.privileges) {
          if (privileges.indexOf(sub) === -1) privileges.push(sub);
        }
      }
      const payload = {
        username: user2.username,
        privileges: privileges,
        sub: user2.id,
      };

      const access_token = sign(payload, jwtConstants_access.secret, {
        expiresIn: '1d',
      });
      const refresh_token = sign(payload, jwtConstants_refresh.secret, {
        expiresIn: '7d',
      });

      return {
        access_token,
        refresh_token,
      };
    } else {
      return false;
    }
  }

  async loginResolver(loginInput: LoginInput, response: any) {
    console.log('login->auth.service ');
    if (await this.validateUser(loginInput.username, loginInput.password)) {
      const user2 = await this.userService.findOne(loginInput.username);
      const payload = {
        username: user2.username,
        roles: user2.roles,
        sub: user2.id,
        userId: user2.id,
      };

      const access_token = sign(payload, jwtConstants_access.secret, {
        expiresIn: '15min',
      });
      const refresh_token = sign(payload, jwtConstants_refresh.secret, {
        expiresIn: '7d',
      });

      response.res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        domain: 'localhost',
        expires: new Date(Date.now() + 60 * 60 * 60 * 24 * 7),
      });

      return {
        access_token,
      };
    } else {
      return null;
    }
  }

  public async getUserFromAuthenticationToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: jwtConstants_access.secret,
    });
    if (payload.userId) {
      return this.userService.findOne(payload.username);
    }
  }

  //   async logout(loginInput:LoginInput) {
  //     console.log("login->auth.service ");
  //     if(await this.validateUser(loginInput.username,loginInput.password))
  //     {
  //         const user2 = await this.userService.findOne(loginInput.username);
  //         const payload = { username: user2.username, roles:user2.roles, sub: user2.id};

  //         const access_token=sign(payload,jwtConstants_access.secret,{expiresIn:"15min"});
  //         const refresh_token=sign(payload,jwtConstants_refresh.secret,{expiresIn:"7d"});

  //         return {
  //             access_token,refresh_token
  //         };
  //     }
  //     else{
  //         return false;
  //     }
  // }
}
