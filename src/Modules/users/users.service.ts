import {
  ConflictException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { GetUserDto, updatePassDto } from './dto/get-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    const userCheck = await this.userRepo.findOne({
      where: { email: user.email },
    });
    if (userCheck)
      throw new ConflictException('Email уже существует в системе');

    const hash = await bcrypt.hash(user.password, 8);
    const newUser = { ...user, password: hash, date: Date.now() };
    console.log('user', newUser);

    return await this.userRepo.save(newUser);
  }

  async getUser(getUserDto: GetUserDto): Promise<User> {
    let [key, value]: string[] = Object.entries(getUserDto)[0];
    const user = await this.userRepo.findOne({
      where: { [key]: value },
    });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async getUsernameByUUID(uuid: string) {
    const user = await this.userRepo.findOne({
      where: { id: uuid },
      select: { username: true },
    });

    return user.username;
  }

  @UseGuards(JwtAuthGuard)
  async updatePassword(passworObj: updatePassDto) {
    const user = await this.userRepo.findOne({ where: { id: passworObj.id } });
    const hash = await bcrypt.hash(passworObj.newPass, 10);
    await this.userRepo.save({ ...user, password: hash });
    return 'Пароль изменён';
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return await this.userRepo.remove(user);
  }
}
