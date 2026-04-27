import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Update exams table
  await knex.schema.alterTable('exams', (table) => {
    table.boolean('hide_score_on_cheating').defaultTo(false);
  });

  // Update exam_attempts table
  await knex.schema.alterTable('exam_attempts', (table) => {
    table.boolean('is_cheated').defaultTo(false);
  });

  // Create exam_attempt_activities table
  await knex.schema.createTable('exam_attempt_activities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('attempt_id')
      .references('id')
      .inTable('exam_attempts')
      .onDelete('CASCADE');
    table.string('event_type').notNullable(); // FOCUS, UNFOCUS
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('exam_attempt_activities');

  await knex.schema.alterTable('exam_attempts', (table) => {
    table.dropColumn('is_cheated');
  });

  await knex.schema.alterTable('exams', (table) => {
    table.dropColumn('hide_score_on_cheating');
  });
}
