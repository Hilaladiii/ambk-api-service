import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Auth } from 'src/commons/decorators/auth.decorator';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login({ ...body });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 20 * 60 * 60 * 1000,
    });

    return true;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
  }

  @Get('me')
  @Auth()
  async getMe(@GetCurrentUser('sub') userId: string) {
    return this.authService.getMe(userId);
  }
}
