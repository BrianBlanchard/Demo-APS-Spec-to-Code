import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.string('transaction_id', 16).primary();
    table.string('account_id', 11).notNullable();
    table.string('transaction_type', 2).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.text('description').notNullable();
    table.string('status', 20).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('account_id').references('accounts.account_id').onDelete('CASCADE');
    table.index('account_id');
    table.index('transaction_type');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
