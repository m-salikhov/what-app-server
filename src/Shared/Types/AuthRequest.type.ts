import type { Request } from "express";
import type { UserWithoutPassword } from "./UserWithoutPassword.type";

export interface AuthenticatedRequest extends Request {
	user: UserWithoutPassword;
}
