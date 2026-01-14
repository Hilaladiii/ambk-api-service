import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_answers', (table) => {
    table.unique(['attemp_id', 'question_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_answers', (table) => {
    table.dropUnique(['attemp_id', 'question_id']);
  });
}
