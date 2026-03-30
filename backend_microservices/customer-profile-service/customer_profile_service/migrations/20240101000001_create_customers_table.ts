import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('customers', (table) => {
    table.string('customer_id', 9).primary().notNullable();
    table.string('first_name', 25).notNullable();
    table.string('middle_name', 25).nullable();
    table.string('last_name', 25).notNullable();
    table.date('date_of_birth').notNullable();
    table.string('ssn', 11).notNullable();
    table.string('government_id', 20).notNullable();
    table.string('address_line1', 50).notNullable();
    table.string('address_line2', 50).nullable();
    table.string('city', 50).notNullable();
    table.string('state', 2).notNullable();
    table.string('zip_code', 10).notNullable();
    table.string('country', 50).notNullable().defaultTo('USA');
    table.string('phone1', 15).notNullable();
    table.string('phone2', 15).nullable();
    table.string('eft_account_id', 20).notNullable();
    table.boolean('is_primary_cardholder').notNullable().defaultTo(true);
    table.integer('fico_score').nullable();
    table.enum('status', ['active', 'inactive', 'suspended']).notNullable().defaultTo('active');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.string('updated_by', 8).notNullable();
    table.integer('version').notNullable().defaultTo(1);

    // Indexes
    table.index('ssn');
    table.index('status');
    table.index(['last_name', 'first_name']);
    table.index('created_at');
  });

  // Create trigger to update updated_at timestamp
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_customers_updated_at ON customers');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column');
  await knex.schema.dropTableIfExists('customers');
}
