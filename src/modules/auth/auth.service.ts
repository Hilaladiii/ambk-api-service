import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import { JwtService } from '@nestjs/jwt';
import { LoginRequest } from './interface';
import * as argon from 'argon2';
@Injectable()
export class AuthService {
  constructor(
    @Inject(KNEX_CONNECTION) private knex: Knex,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginRequest) {
    try {
      const user = await this.knex('users')
        .select('id', 'email', 'username', 'password')
        .where({ email })
        .first();
      if (!user) throw new BadRequestException('User belum terdaftar!');

      const isPasswordValid = await argon.verify(user.password, password);
      if (!isPasswordValid)
        throw new BadRequestException('Email atau password salah');

      const token = this.jwtService.sign({
        sub: user.id,
        username: user.username,
      });

      return token;
    } catch (error) {
      throw error;
    }
  }
}
