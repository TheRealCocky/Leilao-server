import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// CHAVE usada pelo guard
export const ROLES_KEY = 'roles';

// Decorator que anexa os roles necessários ao handler
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
