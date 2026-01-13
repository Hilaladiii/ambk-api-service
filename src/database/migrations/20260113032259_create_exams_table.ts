import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('exams', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title', 100);
    table.text('description').nullable();
    table.uuid('created_by').references('id').inTable('users');
    table.timestamp('start_time');
    table.timestamp('end_time');
    table.smallint('duration');
    table.boolean('is_published').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('exams');
}
