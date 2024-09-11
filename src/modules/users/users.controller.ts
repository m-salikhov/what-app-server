import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { updatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UsersService } from './users.service';
import { Response } from 'express';

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
  @Put()
  async updateUser(@Body() passObj: updatePassDto) {
    return await this.usersService.updatePassword(passObj);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/userresult')
  async createTournament(@Body() userResultDto: UserResultDto) {
    return await this.usersService.createUserResult(userResultDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/userresultfull')
  async getUserResultFull(@Body() idDto: { id: string }) {
    return await this.usersService.getUserResultFull(idDto.id);
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
