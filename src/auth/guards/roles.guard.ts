import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/get-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Pega os roles permitidos do decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota não exige role específica, permite o acesso
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    // Se não há user no request (JWT ausente), bloqueia
    if (!user) return false;

    // Verifica se o papel do user está entre os permitidos
    return requiredRoles.includes(user.role);
  }
}
