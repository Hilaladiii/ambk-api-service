import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('exam_attemps', (table) => {
    table.timestamp('started_at').nullable().alter();
    table.timestamp('finished_at').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('exam_attems', (table) => {
    table.timestamp('started_at').notNullable().alter();
    table.timestamp('finished_at').notNullable().alter();
  });
}
