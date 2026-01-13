import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_answers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('attemp_id').references('id').inTable('exam_attemps');
    table.uuid('question_id').references('id').inTable('questions');
    table.jsonb('answer');
    table.smallint('score_obtained');
    table.text('feedback').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_answers');
}
