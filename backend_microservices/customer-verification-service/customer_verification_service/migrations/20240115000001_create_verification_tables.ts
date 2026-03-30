import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create verification_records table
  await knex.schema.createTable('verification_records', (table) => {
    table.string('verification_id', 25).primary();
    table.string('customer_id', 9).notNullable();
    table.string('verification_type', 20).notNullable();
    table.string('status', 20).notNullable();
    table.string('overall_result', 20).nullable();
    table.timestamp('initiated_at', { useTz: true }).notNullable();
    table.timestamp('completed_at', { useTz: true }).nullable();
    table.string('priority', 10).notNullable();
    table.boolean('manual_review_required').notNullable().defaultTo(false);
    table.string('approval_status', 20).notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index('customer_id');
    table.index('status');
    table.index('initiated_at');
  });

  // Create verification_checks table
  await knex.schema.createTable('verification_checks', (table) => {
    table.uuid('check_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('verification_id', 25).notNullable();
    table.string('check_type', 30).notNullable();
    table.string('status', 20).notNullable();
    table.string('result', 20).nullable();
    table.jsonb('details').notNullable();
    table.timestamp('started_at', { useTz: true }).notNullable();
    table.timestamp('completed_at', { useTz: true }).nullable();
    table.text('error_message').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.foreign('verification_id').references('verification_records.verification_id');
    table.index('verification_id');
    table.index('check_type');
    table.index('status');
  });

  // Create customers table (simplified for verification purposes)
  await knex.schema.createTable('customers', (table) => {
    table.string('customer_id', 9).primary();
    table.string('ssn', 11).nullable();
    table.date('date_of_birth').nullable();
    table.string('government_id', 20).nullable();
    table.string('government_id_type', 30).nullable();
    table.string('government_id_state', 2).nullable();
    table.jsonb('address').nullable();
    table.integer('fico_score').nullable();
    table.string('verification_status', 20).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.unique('ssn');
    table.index('verification_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('verification_checks');
  await knex.schema.dropTableIfExists('verification_records');
  await knex.schema.dropTableIfExists('customers');
}
