import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ResultElem, UserResult } from './entity/userResult.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User, UserResult, ResultElem]),
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRED },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
