import { Strategy } from 'passport-jwt';
import { Request } from 'express';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(req: Request, payload: any): Promise<{
        id: any;
        username: any;
    }>;
}
export {};
