import { CreateUserDto } from './dto/create-user.dto';
import { updatePassDto } from './dto/get-user.dto';
import { UserResultDto } from './dto/userResult.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(user: CreateUserDto): Promise<{
        id: string;
        username: string;
        role: "user" | "superuser" | "admin";
        email: string;
        date: number;
    }>;
    getLastTen(uuid: string): Promise<string>;
    updateUser(passObj: updatePassDto): Promise<string>;
    createTournament(userResultDto: UserResultDto): Promise<Omit<import("./entity/userResult.entity").UserResult, "id"> & import("./entity/userResult.entity").UserResult>;
    getUserResultFull(idDto: {
        id: string;
    }): Promise<import("./entity/userResult.entity").UserResult[]>;
    getUserResultShort(idDto: {
        id: string;
    }): Promise<import("./entity/userResult.entity").UserResult[]>;
    delOneCar(id: string): Promise<import("./entity/user.entity").User>;
}
