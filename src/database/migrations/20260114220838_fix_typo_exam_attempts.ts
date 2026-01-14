import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('exam_attemps', 'exam_attempts');

  await knex.schema.renameTable(
    'exam_attemp_questions',
    'exam_attempt_questions',
  );
  await knex.schema.alterTable('exam_attempt_questions', (table) => {
    table.renameColumn('attemp_id', 'attempt_id');
  });

  await knex.schema.alterTable('user_answers', (table) => {
    table.renameColumn('attemp_id', 'attempt_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user_answers', (table) => {
    table.renameColumn('attempt_id', 'attemp_id');
  });

  await knex.schema.alterTable('exam_attempt_questions', (table) => {
    table.renameColumn('attempt_id', 'attemp_id');
  });

  await knex.schema.renameTable(
    'exam_attempt_questions',
    'exam_attemp_questions',
  );

  await knex.schema.renameTable('exam_attempts', 'exam_attemps');
}
