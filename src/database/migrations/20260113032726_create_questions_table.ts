import type { Knex } from 'knex';

enum QuestionType {
  MULTIPLE = 'MULTIPLE',
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING',
  TRUE_FALSE = 'TRUE_FALSE',
}

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('exam_id').references('id').inTable('exams').onDelete('CASCADE');
    table.enum('type', [QuestionType]);
    table.text('question');
    table.smallint('point');
    table.jsonb('structure');
    table.jsonb('correct_answer');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('questions');
}
