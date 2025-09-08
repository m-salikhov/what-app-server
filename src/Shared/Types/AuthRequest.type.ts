import { Request } from 'express';
import { UserWithoutPassword } from './UserWithoutPassword.type';

export interface AuthenticatedRequest extends Request {
  user: UserWithoutPassword;
}
