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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { publicAccount } from 'src/Shared/constants/user.constants';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

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
      maxAge: this.configService.get('COOKIES_MAX_AGE'),
      sameSite: 'none',
      secure: true,
    });

    return savedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Put('/change-password')
  async updateUser(@Body() updatePassDto: UpdatePassDto) {
    if (updatePassDto.id === publicAccount.id) {
      throw new ForbiddenException('Нельзя изменить пароль этого пользователя');
    }

    return await this.usersService.updatePassword(updatePassDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/user-result')
  async createTournament(@Body() userResultDto: UserResultDto) {
    return await this.usersService.createUserResult(userResultDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:email')
  async getUser(@Param('email') email: string) {
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new ForbiddenException(
        'This route is only available in development mode',
      );
    }
    return await this.usersService.getUserByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user-result-full/:id')
  async getUserResultFull(@Param('id') id: string) {
    return await this.usersService.getUserResultFull(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user-result-short/:id')
  async getUserResultShort(@Param('id') id: string) {
    return await this.usersService.getUserResultShort(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delOneCar(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
