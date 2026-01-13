import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';

export const KNEX_CONNECTION = 'KNEX_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        return knex({
          client: 'pg',
          connection: {
            host: configService.get('DB_HOST'),
            user: configService.get('DB_USER'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class KnexModule {}
