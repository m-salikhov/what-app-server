import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request?.user;

    if (user?.role !== 'admin') {
      throw new ForbiddenException('Требуется права администратора');
    }

    return true;
  }
}

@Injectable()
export class SelfGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === 'admin') return true;

    if (user.role === 'user') {
      if (user.role === 'user') {
        // Проверим, что id в параметрах совпадает с id пользователя из JWT
        const paramUserId = request.params.id;

        if (!paramUserId) {
          throw new BadRequestException('User id param not found');
        }

        if (paramUserId !== user.id) {
          throw new ForbiddenException('Users can access only their own data');
        }
        return true;
      }
    }

    throw new ForbiddenException('Role not allowed');
  }
}
