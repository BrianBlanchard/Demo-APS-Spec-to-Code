import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cards', (table) => {
    table.string('card_number', 16).primary();
    table.string('account_id', 20).notNullable().index();
    table.string('customer_id', 20).notNullable().index();
    table.string('embossed_name', 100).notNullable();
    table.string('cvv', 3).notNullable();
    table.date('expiration_date').notNullable();
    table.date('issued_date').notNullable();
    table.string('status', 20).notNullable().defaultTo('active');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index(['status']);
    table.index(['account_id', 'status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cards');
}
