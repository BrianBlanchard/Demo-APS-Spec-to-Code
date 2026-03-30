import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('customers', (table) => {
    table.string('customer_id', 9).primary().notNullable();
    table.string('first_name', 25).notNullable();
    table.string('middle_name', 25).nullable();
    table.string('last_name', 25).notNullable();
    table.date('date_of_birth').notNullable();
    table.string('ssn', 255).notNullable().unique();
    table.string('government_id', 255).notNullable().unique();
    table.string('address_line1', 50).notNullable();
    table.string('address_line2', 50).nullable();
    table.string('address_line3', 50).nullable();
    table.string('city', 50).notNullable();
    table.string('state', 2).notNullable();
    table.string('zip_code', 10).notNullable();
    table.string('country', 3).notNullable();
    table.string('phone1', 15).notNullable();
    table.string('phone2', 15).nullable();
    table.string('eft_account_id', 20).nullable();
    table.string('is_primary_cardholder', 1).notNullable();
    table.smallint('fico_score').notNullable();
    table.string('status', 20).notNullable();
    table.string('verification_status', 30).notNullable();
    table.decimal('credit_limit', 12, 2).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.string('created_by', 8).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.string('updated_by', 8).notNullable();

    // Indexes
    table.index('ssn');
    table.index('government_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('customers');
}
