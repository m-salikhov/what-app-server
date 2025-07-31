import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"База вопросов" <${process.env.ADMIN_EMAIL}>`,
      },
      // template: {
      //   dir: join(__dirname, 'templates'),
      //   adapter: new PugAdapter(),
      //   options: {
      //     strict: true,
      //   },
      // },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
