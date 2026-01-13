import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('exam_attemps', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('exam_id').references('id').inTable('exams');
    table.uuid('user_id').references('id').inTable('users');
    table.timestamp('started_at');
    table.timestamp('finished_at');
    table.smallint('total_score');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('exam_attemps');
}
