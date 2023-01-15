import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto, updatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getLastTen(uuid: string): Promise<string>;
    createTournament(userResultDto: UserResultDto): Promise<Omit<import("./entity/userResult.entity").UserResult, "id"> & import("./entity/userResult.entity").UserResult>;
    createUser(user: CreateUserDto): Promise<import("./entity/user.entity").User>;
    getUser(getUserDto: GetUserDto): Promise<{
        id: string;
        username: string;
        role: "user" | "superuser" | "admin";
        email: string;
        date: number;
    }>;
    updateUser(passObj: updatePassDto): Promise<string>;
    delOneCar(id: string): Promise<import("./entity/user.entity").User>;
}
