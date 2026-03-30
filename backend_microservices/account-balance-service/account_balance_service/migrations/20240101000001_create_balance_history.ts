import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('balance_history', (table) => {
    table.uuid('history_id').primary();
    table.string('account_id', 11).notNullable();
    table.string('transaction_id', 16).notNullable();
    table.decimal('previous_balance', 15, 2).notNullable();
    table.decimal('new_balance', 15, 2).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('transaction_type', 20).notNullable();
    table.timestamp('recorded_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('account_id').references('account_balances.account_id');
    table.index('account_id');
    table.index('transaction_id');
    table.index('recorded_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('balance_history');
}
