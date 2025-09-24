import {
	BadRequestException,
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import type { AuthenticatedRequest } from "src/Shared/Types/AuthRequest.type";

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const user = request.user;

		if (user.role !== "admin") {
			throw new ForbiddenException("Требуется права администратора");
		}

		return true;
	}
}

@Injectable()
export class SelfGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const user = request.user;

		// Администратор всегда имеет доступ
		if (user.role === "admin") return true;

		if (user.role === "user") {
			// Проверяем, что id в параметрах совпадает с id пользователя из JWT
			const paramUserId = request.params.id;

			if (!paramUserId) {
				throw new BadRequestException("User id param not found");
			}

			if (paramUserId !== user.id) {
				throw new ForbiddenException("Users can access only their own data");
			}
			return true;
		}

		throw new ForbiddenException("Role not allowed");
	}
}
