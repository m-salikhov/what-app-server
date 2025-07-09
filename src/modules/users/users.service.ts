import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { UserResultDto } from './dto/userResult.dto';
import { UserResult, ResultElem } from './entity/userResult.entity';
import { JwtService } from '@nestjs/jwt';
import { updatePassDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserResult)
    private userResultRepo: Repository<UserResult>,
    @InjectRepository(ResultElem)
    private resultElemRepo: Repository<ResultElem>,
    private jwtService: JwtService,
  ) {}

  async createUser(user: CreateUserDto) {
    const userCheck = await this.userRepo.findOne({
      where: { email: user.email },
    });
    if (userCheck)
      throw new ConflictException('Email уже существует в системе');

    const hash = await bcrypt.hash(user.password, 8);

    const { password, ...savedNewUser } = await this.userRepo.save({
      ...user,
      date: Date.now(),
      password: hash,
    });

    const payload = { username: savedNewUser.username, id: savedNewUser.id };

    const access_token = this.jwtService.sign(payload);

    return { savedNewUser, access_token };
  }

  async updatePassword(passwordObj: updatePassDto) {
    const user = await this.userRepo.findOne({ where: { id: passwordObj.id } });
    const hash = await bcrypt.hash(passwordObj.newPass, 10);
    await this.userRepo.save({ ...user, password: hash });
    return { message: 'Пароль изменён' };
  }

  async createUserResult(userResultDto: UserResultDto) {
    const resultCheck = await this.userResultRepo.findOne({
      where: {
        userId: userResultDto.userId,
        tournamentId: userResultDto.tournamentId,
      },
    });

    if (resultCheck) throw new ConflictException('Результат уже существует');

    const savedResultElems: ResultElem[] = [];
    for await (const resultElem of userResultDto.result) {
      let resultElemToSave = new ResultElem();
      resultElemToSave = { ...resultElemToSave, ...resultElem };
      let savedElem = await this.resultElemRepo.save(resultElemToSave);
      savedResultElems.push(savedElem);
    }

    const newUserResult: Omit<UserResult, 'id'> = {
      ...userResultDto,
      result: savedResultElems,
      date: Date.now(),
    };

    const result = await this.userResultRepo.save(newUserResult);

    return result;
  }

  async getUserResultShort(id: string) {
    const result = await this.userResultRepo.find({
      where: { userId: id },
      order: { date: 'DESC' },
    });

    //TODO исправить БД, чтобы сохраняла числа
    result.forEach((v) => (v.date = +v.date));

    return result;
  }

  async getUserResultFull(id: string) {
    const result = await this.userResultRepo.find({
      where: { userId: id },
      order: { date: 'DESC' },
      relations: ['result'],
    });

    //TODO исправить БД, чтобы сохраняла числа
    result.forEach((v) => (v.date = +v.date));

    return result;
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return await this.userRepo.remove(user);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }
}
