import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('exams', (table) => {
    table.string('start_time', 50).alter();
    table.string('end_time', 50).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('exams', (table) => {
    table.timestamp('start_time').alter();
    table.timestamp('end_time').alter();
  });
}
