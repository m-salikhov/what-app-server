import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { guestAccount } from "src/Shared/constants/user.constants";
import { AuthenticatedRequest } from "src/Shared/Types/AuthRequest.type";

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

@Injectable()
export class OptionalAuthGuard extends AuthGuard("jwt") {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			// super.canActivate() вызовет JwtStrategy.validate,
			return await (super.canActivate(context) as Promise<boolean>);
		} catch {
			// Если валидация JWT не прошла, то пропускаем и устанавливаем guest
			return true;
		}
	}

	handleRequest(_err, user) {
		return user || guestAccount;
	}
}
