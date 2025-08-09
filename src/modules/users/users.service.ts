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
import { UpdatePassDto } from './dto/get-user.dto';
import { MailService } from '../mail/mail.service';

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
    private mailService: MailService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const emailCheck = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (emailCheck)
      throw new ConflictException('Почта уже существует в системе');

    const usernameCheck = await this.userRepo.findOne({
      where: { username: createUserDto.username },
    });
    if (usernameCheck)
      throw new ConflictException('Логин уже существует в системе');

    const hash = await bcrypt.hash(createUserDto.password, 8);

    const { password, ...savedUser } = await this.userRepo.save({
      ...createUserDto,
      date: Date.now(),
      password: hash,
    });

    const payload = { username: savedUser.username, id: savedUser.id };

    const access_token = this.jwtService.sign(payload);

    await this.mailService.sendAdminEmail(
      'Регистрация',
      `Пользователь ${savedUser.username} зарегистрировался`,
    );

    return { savedUser, access_token };
  }

  async updatePassword(updatePassDto: UpdatePassDto) {
    const hash = await bcrypt.hash(updatePassDto.newPass, 8);
    await this.userRepo.update(updatePassDto.id, { password: hash });
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

    return result;
  }

  async getUserResultFull(id: string) {
    const result = await this.userResultRepo.find({
      where: { userId: id },
      order: { date: 'DESC' },
      relations: ['result'],
    });

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
