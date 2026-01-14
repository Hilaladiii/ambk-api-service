import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user_answers', (table) => {
    table.smallint('score_obtained').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user_answers', (table) => {
    table.smallint('score_obtained').alter();
  });
}
