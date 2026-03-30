import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.string('transaction_id', 16).primary();
    table.string('account_id', 11).notNullable().index();
    table.string('card_number', 16).notNullable().index();
    table.string('transaction_type', 2).notNullable().index();
    table.string('transaction_category', 4).notNullable();
    table.decimal('amount', 12, 2).notNullable().index();
    table.string('description', 255).notNullable();
    table.string('merchant_name', 100).notNullable().index();
    table.string('merchant_city', 100);
    table.timestamp('original_timestamp').notNullable().index();
    table.timestamp('posted_timestamp').notNullable();
    table.string('status', 20).notNullable().defaultTo('posted');
    table.timestamps(true, true);
  });

  // Create composite indexes for common search patterns
  await knex.schema.raw(
    'CREATE INDEX idx_transactions_account_date ON transactions(account_id, original_timestamp DESC)'
  );
  await knex.schema.raw(
    'CREATE INDEX idx_transactions_card_date ON transactions(card_number, original_timestamp DESC)'
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
