import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.string('payment_confirmation_number', 50).notNullable().unique().index();
    table.string('transaction_id', 16).notNullable();
    table.string('account_id', 11).notNullable().index();
    table.decimal('payment_amount', 12, 2).notNullable();
    table.enum('payment_method', ['eft', 'credit_card', 'debit_card']).notNullable();
    table.decimal('previous_balance', 12, 2).notNullable();
    table.decimal('new_balance', 12, 2).notNullable();
    table.date('payment_date').notNullable();
    table.enum('status', ['posted', 'pending', 'failed']).notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
}
