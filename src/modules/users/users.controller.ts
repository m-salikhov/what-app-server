import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto, updatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    const { password, ...newUserWithoutPass } =
      await this.usersService.createUser(user);
    return newUserWithoutPass;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/username/:uuid')
  async getLastTen(@Param('uuid') uuid: string) {
    return this.usersService.getUsernameByUUID(uuid);
  }

  // @Post('getuser')
  // async getUser(@Body() getUserDto: GetUserDto) {
  //   const _user = await this.usersService.getUser(getUserDto);
  //   const { password, ...user } = _user;
  //   return user;
  // }

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
  @Post('/userresultshort')
  async getUserResultShort(@Body() idDto: { id: string }) {
    return await this.usersService.getUserResultShort(idDto.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delOneCar(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
