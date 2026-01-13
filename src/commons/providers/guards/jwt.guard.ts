import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const tokenCookie = request.cookies?.token;
      if (!tokenCookie) return false;

      const token = this.jwtService.verify(tokenCookie);

      if (!token) return false;

      request.user = token;

      return true;
    } catch (error) {
      return false;
    }
  }
}
