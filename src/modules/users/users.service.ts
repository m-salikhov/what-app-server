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
import { GetUserDto, updatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UserResult, ResultElem } from './entity/userResult.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserResult)
    private userResultRepo: Repository<UserResult>,
    @InjectRepository(ResultElem)
    private resultElemRepo: Repository<ResultElem>,
  ) {}

  async createUser(user: CreateUserDto) {
    const userCheck = await this.userRepo.findOne({
      where: { email: user.email },
    });
    if (userCheck)
      throw new ConflictException('Email уже существует в системе');

    const hash = await bcrypt.hash(user.password, 8);

    const id = uuidv4();

    const newUser = this.userRepo.create({
      ...user,
      id,
      password: hash,
      date: Date.now(),
    });

    const { password, ...rest } = await this.userRepo.save(newUser);

    return rest;
  }

  async getUser(getUserDto: GetUserDto): Promise<User> {
    let [key, value]: string[] = Object.entries(getUserDto)[0];
    const user = await this.userRepo.findOne({
      where: { [key]: value },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async updatePassword(passworObj: updatePassDto) {
    const user = await this.userRepo.findOne({ where: { id: passworObj.id } });
    const hash = await bcrypt.hash(passworObj.newPass, 10);
    await this.userRepo.save({ ...user, password: hash });
    return 'Пароль изменён';
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

    let tours = Math.max(...Object.keys(userResultDto.result).map((v) => +v));

    for (let i = 1; i <= tours; i++) {
      for await (const resultElem of userResultDto.result[i]) {
        let resultElemToSave = new ResultElem();

        resultElemToSave = { ...resultElemToSave, ...resultElem, tour: i };
        let savedElem = await this.resultElemRepo.save(resultElemToSave);
        savedResultElems.push(savedElem);
      }
    }

    const newUserResult: Omit<UserResult, 'id'> = {
      ...userResultDto,
      result: savedResultElems,
      date: Date.now(),
    };

    return await this.userResultRepo.save(newUserResult);
  }

  async getUserResultShort(id: string) {
    let result = await this.userResultRepo.find({
      where: { userId: id },
    });
    return result;
  }

  async getUserResultFull(id: string) {
    const res = await this.userResultRepo.find({
      where: { userId: id },
      relations: ['result'],
      select: {
        result: {
          ans: true,
          num: true,
        },
      },
    });
    return res;
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return await this.userRepo.remove(user);
  }
}
