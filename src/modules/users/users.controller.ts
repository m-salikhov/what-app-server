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
import { GetUserDto, updatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { publicAccount } from './constants/user.constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() user: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { savedNewUser, access_token } = await this.usersService.createUser(
      user,
    );

    response.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: 259200000,
      sameSite: 'none',
      secure: true,
    });

    return savedNewUser;
  }

  @UseGuards(JwtAuthGuard)
  @Put('/changepassword')
  async updateUser(@Body() passObj: updatePassDto) {
    if (passObj.id === publicAccount.id) {
      throw new ForbiddenException('Нельзя изменить пароль этого пользователя');
    }

    return await this.usersService.updatePassword(passObj);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/userresult')
  async createTournament(@Body() userResultDto: UserResultDto) {
    return await this.usersService.createUserResult(userResultDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/getuser')
  async getUser(@Body() getUserDto: GetUserDto) {
    return await this.usersService.getUser(getUserDto);
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
