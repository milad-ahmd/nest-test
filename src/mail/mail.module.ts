import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
// import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    // MailerModule.forRoot({
    //   // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
    //   // or
    //   transport: {
    //     host: 'smtp.gmail.com',
    //     secure: false,
    //     auth: {
    //       user: 'booda.nabooda.01@gmail.com',
    //       pass: 'a1a9s1s9',
    //     },
    //   },
    //   defaults: {
    //     from: '"No Reply" <colife-backEndTeam@colife.com>',
    //   },
    //   template: {
    //     dir: join(__dirname, 'templates'),
    //     adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
    //     options: {
    //       strict: true,
    //     },
    //   },
    // }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}


