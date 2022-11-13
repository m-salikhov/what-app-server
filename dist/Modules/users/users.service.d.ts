import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { GetUserDto, updatePassDto } from './dto/get-user.dto';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    createUser(user: CreateUserDto): Promise<User>;
    getUser(getUserDto: GetUserDto): Promise<User>;
    getUsernameByUUID(uuid: string): Promise<string>;
    updatePassword(passworObj: updatePassDto): Promise<string>;
    deleteUser(id: string): Promise<User>;
}
