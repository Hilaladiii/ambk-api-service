import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('exam_attemp_questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('attemp_id')
      .references('id')
      .inTable('exam_attemps')
      .onDelete('CASCADE');
    table
      .uuid('question_id')
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table.integer('sort_order').notNullable();
    table.boolean('is_flagged').defaultTo(false);
    table.unique(['attemp_id', 'question_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('exam_attemp_questions');
}
