import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import { CreateUserRequest } from './interface';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) {}

  async create({ email, password, username }: CreateUserRequest) {
    try {
      const user = await this.knex('users')
        .select('email')
        .where({ email })
        .orWhere({ username })
        .first();

      if (user)
        throw new BadRequestException(
          'Email atau username sudah terdaftar. Gunakan email atau username lain',
        );

      const hashedPassword = await argon.hash(password);
      const [newUser] = await this.knex('users')
        .insert({
          email,
          username,
          password: hashedPassword,
        })
        .returning(['email', 'username']);

      return newUser;
    } catch (error) {
      throw error;
    }
  }
}
