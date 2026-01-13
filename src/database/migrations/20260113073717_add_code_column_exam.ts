import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('exams', (table) => {
    table.string('code', 20).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('exams', (table) => {
    table.dropColumn('code');
  });
}
