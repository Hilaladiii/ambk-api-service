import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { Knex } from 'knex';
import { CreateUserRequest, UpdateUserRequest } from './interface';
import * as argon from 'argon2';
import { responsePaginate } from 'src/commons/utils/pagination';
import { PaginationParams } from 'src/commons/types/pagination.type';

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

  async get(id: string) {
    try {
      const user = await this.knex('users')
        .select('id', 'email', 'role', 'username', 'created_at')
        .where({ id })
        .first();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, payload: UpdateUserRequest) {
    try {
      const user = await this.knex('users')
        .select('username', 'password')
        .where({ id })
        .first();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updateData: any = {};
      if (payload.username) {
        updateData.username = payload.username;
        user.username = payload.username;
      }
      
      if (payload.newPassword) {
        if (!payload.previousPassword)
          throw new BadRequestException('Previous password must be provided!');

        const isPreviousValid = await argon.verify(
          user.password,
          payload.previousPassword,
        );

        if (!isPreviousValid)
          throw new BadRequestException('Previous password incorrect!');

        const newPassword = await argon.hash(payload.newPassword);
        updateData.password = newPassword;
      }

      if (Object.keys(updateData).length > 0) {
        await this.knex('users')
          .update(updateData)
          .where({ id });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async findAll(pagination: PaginationParams, search?: string) {
    try {
      const query = this.knex('users')
        .select('id', 'email', 'username', 'role', 'created_at')
        .orderBy('created_at', 'desc');

      if (search) {
        query.where((builder) => {
          builder.where('email', 'ilike', `%${search}%`)
                 .orWhere('username', 'ilike', `%${search}%`);
        });
      }

      return responsePaginate(query, pagination);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.knex('users').where({ id }).del();
      if (!deleted) throw new NotFoundException('User not found');
      return true;
    } catch (error) {
      throw error;
    }
  }
}
