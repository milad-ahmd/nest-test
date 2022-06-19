import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor() {}

  // async sendUserConfirmation(mail: string, token: string) {
  //   const url = `example.com/auth/confirm?token=${token}`;
  //   await this.mailerService.sendMail({
  //     to: mail,
  //     // from: '"Support Team" <support@example.com>', // override default from
  //     subject: 'Welcome to Nice App! Confirm your Email',
  //     template: './confirmation', // `.hbs` extension is appended automatically
  //     context: {
  //       mail,
  //     },
  //   });
  // }
}