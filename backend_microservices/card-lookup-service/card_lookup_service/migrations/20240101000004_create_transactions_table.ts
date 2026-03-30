import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.string('transactionId', 30).primary();
    table.string('cardNumber', 16).notNullable();
    table.string('accountId', 20).notNullable();
    table.timestamp('transactionDate').notNullable();
    table.string('merchantName', 255).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');
    table.string('status', 20).notNullable().defaultTo('completed');
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    table.foreign('cardNumber').references('cards.cardNumber').onDelete('CASCADE');
    table.foreign('accountId').references('accounts.accountId').onDelete('CASCADE');
    table.index(['cardNumber', 'transactionDate']);
    table.index(['accountId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
