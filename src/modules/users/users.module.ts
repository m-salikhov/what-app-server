import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ResultElem, UserResult } from './entity/userResult.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserResult, ResultElem])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
