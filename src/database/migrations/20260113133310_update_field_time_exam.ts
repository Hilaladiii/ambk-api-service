import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('exams', (table) => {
    table.timestamp('start_time').alter();
    table.timestamp('end_time').alter();
  });

  await knex.schema.alterTable('questions', (table) => {
    table.dropForeign(['exam_id']);

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')
      .onDelete('CASCADE');
  });

  await knex.schema.alterTable('exam_attemps', (table) => {
    table.dropForeign(['exam_id']);

    table
      .foreign('exam_id')
      .references('id')
      .inTable('exams')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {}
