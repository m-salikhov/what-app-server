import { AuthService } from './auth.service';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any, response: Response): Promise<any>;
    loginFirst(req: any, response: Response): Promise<import("../users/entity/user.entity").User>;
    logout(response: Response, req: any): string;
}
