import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { publicAccount } from './constants/user.constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { savedUser, access_token } = await this.usersService.createUser(
      createUserDto,
    );

    response.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_MAX_AGE),
      sameSite: 'none',
      secure: true,
    });

    return savedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Put('/changepassword')
  async updateUser(@Body() updatePassDto: UpdatePassDto) {
    if (updatePassDto.id === publicAccount.id) {
      throw new ForbiddenException('Нельзя изменить пароль этого пользователя');
    }

    return await this.usersService.updatePassword(updatePassDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/userresult')
  async createTournament(@Body() userResultDto: UserResultDto) {
    return await this.usersService.createUserResult(userResultDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:email')
  async getUser(@Param('email') email: string) {
    if (process.env.NODE_ENV !== 'development') {
      throw new ForbiddenException(
        'This route is only available in development mode',
      );
    }
    return await this.usersService.getUserByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/userresultfull/:id')
  async getUserResultFull(@Param('id') id: string) {
    return await this.usersService.getUserResultFull(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/userresultshort/:id')
  async getUserResultShort(@Param('id') id: string) {
    return await this.usersService.getUserResultShort(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delOneCar(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
