import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_type_check"`,
  );

  await knex.schema.alterTable('questions', (table) => {
    table.string('type').alter();
  });

  await knex.raw(`
        ALTER TABLE "questions" 
        ADD CONSTRAINT "questions_type_check" 
        CHECK ("type" IN ('MULTIPLE', 'ESSAY', 'MATCHING', 'TRUE_FALSE'))
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_type_check"`,
  );
}
