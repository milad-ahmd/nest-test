import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInput } from '../user.input';
import * as bcrypt from 'bcrypt';
import { User } from '../model/user';
import { MailModule } from 'src/mail/mail.module';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async findOne(username: string): Promise<any | undefined> {
    console.log('findOne->user.serviceee');
    try {
      const user = await this.userModel
        .findOne({ username: username })
        .populate('roles')
        .exec();
      return user;
    } catch (err) {
      console.log(err);
    }
  }

  async findOneByEmail(mail: string): Promise<User | undefined> {
    const user = await this.userModel
      .findOne({ mail: mail })
      // .populate('roles')
      .exec();
    return user;
  }

  async mobileExists(mobile: string): Promise<boolean> {
    const user = await this.userModel.find({ mobile: mobile }).exec();

    if (user.length > 0) {
      console.log('has mobile');
      return true;
    } else return false;
  }

  async userExists(username: string): Promise<boolean> {
    const user = await this.userModel.find({ username: username }).exec();

    if (user.length > 0) {
      console.log('has user');
      return true;
    } else return false;
  }

  async userExistsByMail(mail: string): Promise<boolean> {
    console.log('userExistsByMail->user.service');
    const user = await this.userModel.find({ mail: mail }).exec();

    if (user.length > 0) {
      return true;
    } else return false;
  }

  async createUserResolver(userInput: UserInput): Promise<any> {
    if (!(await this.userExists(userInput.username))) {
      if (!(await this.mobileExists(userInput.mobile))) {
        await this.userModel.create({
          name: userInput.name,
          forgetPassTs: userInput.forgetPassTs,
          forgetPassToken: userInput.forgetPassToken,
          mail: userInput.mail,
          family: userInput.family,
          username: userInput.username,
          password: await bcrypt.hash(
            userInput.password,
            Number(process.env.HASH_SALT),
          ),
          mobile: userInput.mobile,
          roles: userInput.roles,
        });
        const user = await this.userModel
          .find({ mobile: userInput.mobile })
          .exec();
        if (user.length > 0)
          return { success: true, message: 'کاربر با موفقیت ایجاد شد' };
        else
          return {
            success: false,
            message: 'در زمان ایجاد کاربر خطائی رخ داد!',
          };
      } else if (await this.mobileExists(userInput.mobile)) {
        console.log(2);
        return {
          success: false,
          message: 'کاربری با این شماره موبایل در سیستم وجود دارد!',
        };
      }
    } else if (await this.userExists(userInput.username)) {
      console.log(3);
      return {
        success: false,
        message: 'کاربری با این نام کاربری در سیستم وجود دارد!',
      };
    }
  }

  async forgetPassService_getMail(username) {
    if (await this.userExists(username)) {
      const user = await this.findOne(username);
      if (user.mail !== undefined && user.mail !== '') {
        return user.mail;
      } else {
        return 'no mail';
      }
    } else {
      return 'no user';
    }
  }

  async forgetPassService_check(token: string) {
    console.log('i am in check mode');
    const user = await this.userModel
      .findOne({ forgetPassToken: token })
      .exec();
    console.log(user);
    const tokenTime = Number(user.forgetPassTs);
    const currentDate = Date.now() / 1000;
    const diffTime = currentDate - tokenTime;
    if (diffTime > 5 * 60) {
      return false;
    } else {
      return true;
    }
  }

  async forgetPassService_add(mail: string, token: string) {
    const user = await this.findOneByEmail(mail);
    const userInput = new UserInput();
    userInput.username = user.username;
    userInput.password = user.password;
    userInput.mobile = user.mobile;
    userInput.name = user.name;
    userInput.family = user.family;
    userInput.mail = user.mail;
    userInput.forgetPassToken = token;
    userInput.forgetPassTs = (Date.now() / 1000).toString();
    await this.userModel.findOneAndUpdate(
      { username: userInput.username },
      {
        name: userInput.name,
        forgetPassTs: userInput.forgetPassTs,
        forgetPassToken: userInput.forgetPassToken,
        mail: userInput.mail,
        family: userInput.family,
        password: await bcrypt.hash(
          userInput.password,
          Number(process.env.HASH_SALT),
        ),
        mobile: userInput.mobile,
      },
      { new: true },
    );
    return 'we send';
  }

  async forgetPassService_updatePass(username, newPass) {
    const user = await this.userModel.findOneAndUpdate(
      { username: username },
      { password: await bcrypt.hash(newPass, Number(process.env.HASH_SALT)) },
      { new: false },
    );
    return true;
  }

  async updateUserResolver(userInput: UserInput): Promise<string> {
    console.log('updateUserResolver->user.service');
    if (await this.userExists(userInput.username)) {
      if (!(await this.mobileExists(userInput.mobile))) {
        const user = await this.userModel
          .findOne({ username: userInput.username })
          .exec();
        const user2 = await this.userModel.findOneAndUpdate(
          { username: userInput.username },
          {
            name: userInput.name,
            forgetPassTs: userInput.forgetPassTs,
            forgetPassToken: userInput.forgetPassToken,
            mail: userInput.mail,
            family: userInput.family,
            password: await bcrypt.hash(
              userInput.password,
              Number(process.env.HASH_SALT),
            ),
            mobile: userInput.mobile,
          },
          { new: true },
        );

        if (user2) return 'کاربر با موفقیت ویرایش شد';
        else return 'در زمان ویرایش کاربر خطائی رخ داد!';
      } else if (await this.mobileExists(userInput.mobile)) {
        console.log(2);
        return 'کاربری با این شماره موبایل در سیستم وجود دارد!';
      }
    } else if (!(await this.userExists(userInput.username))) {
      console.log(3);
      return 'کاربری با این نام کاربری در سیستم وجود ندارد!';
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async deleteByUsername(username: string): Promise<boolean> {
    const auth = await this.userModel
      .findOneAndDelete({ username: username })
      .exec();

    if ((await this.userExists(username)) == true) return false;
    else return true;
  }
}
