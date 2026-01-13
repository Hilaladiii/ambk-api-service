import { Role } from './role.type';

export type JwtClaims = {
  sub: string;
  role: Role;
};
