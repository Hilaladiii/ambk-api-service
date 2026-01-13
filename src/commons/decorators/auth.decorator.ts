import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../types/role.type';
import { Roles } from './role.decorator';
import { JwtGuard } from '../providers/guards/jwt.guard';
import { RoleGuard } from '../providers/guards/role.guard';

export const Auth = (roles: Role[]) =>
  applyDecorators(Roles(roles), UseGuards(JwtGuard, RoleGuard));
