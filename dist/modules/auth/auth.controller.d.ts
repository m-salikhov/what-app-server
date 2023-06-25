import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { User } from '../users/entity/user.entity';
interface RequestAuth extends Request {
    user: User;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: RequestAuth, response: Response): Promise<User>;
    loginFirst(req: RequestAuth, response: Response): Promise<User>;
    logout(response: Response): string;
}
export {};
