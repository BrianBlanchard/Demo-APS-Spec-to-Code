import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('account_balances', (table) => {
    table.string('account_id', 11).primary();
    table.decimal('current_balance', 15, 2).notNullable().defaultTo(0);
    table.decimal('credit_limit', 15, 2).notNullable();
    table.decimal('cash_credit_limit', 15, 2).notNullable();
    table.decimal('current_cycle_credit', 15, 2).notNullable().defaultTo(0);
    table.decimal('current_cycle_debit', 15, 2).notNullable().defaultTo(0);
    table.date('cycle_start_date').notNullable();
    table.date('cycle_end_date').notNullable();
    table.timestamp('last_transaction_date').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.integer('version').notNullable().defaultTo(1);

    table.index('account_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('account_balances');
}
