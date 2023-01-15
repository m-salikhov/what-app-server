import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { GetUserDto, updatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UserResult, ResultElem } from './entity/userResult.entity';
export declare class UsersService {
    private userRepo;
    private userResultRepo;
    private resultElemRepo;
    constructor(userRepo: Repository<User>, userResultRepo: Repository<UserResult>, resultElemRepo: Repository<ResultElem>);
    createUser(user: CreateUserDto): Promise<User>;
    createUserResult(userResultDto: UserResultDto): Promise<Omit<UserResult, "id"> & UserResult>;
    getUser(getUserDto: GetUserDto): Promise<User>;
    getUsernameByUUID(uuid: string): Promise<string>;
    updatePassword(passworObj: updatePassDto): Promise<string>;
    deleteUser(id: string): Promise<User>;
}
