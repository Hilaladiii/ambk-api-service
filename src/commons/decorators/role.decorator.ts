import { SetMetadata } from '@nestjs/common';
import { Role } from '../types/role.type';

export const Roles = (roles: Role[]) => SetMetadata('roles', roles);
