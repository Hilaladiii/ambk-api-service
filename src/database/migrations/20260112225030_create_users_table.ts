import type { Knex } from 'knex';

enum Role {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
}

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('username', 50).unique();
    table.string('email', 100).unique();
    table.string('password', 255).unique();
    table.timestamps(true, true);
    table.enum('role', Object.values(Role)).defaultTo(Role.PARTICIPANT);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
