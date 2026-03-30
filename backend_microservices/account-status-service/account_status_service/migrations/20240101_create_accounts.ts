import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.string('account_id', 11).primary();
    table.string('account_status', 20).notNullable();
    table.decimal('balance', 15, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('updated_by', 8).notNullable();
    table.integer('version').notNullable().defaultTo(0);

    table.index('account_status');
    table.index('updated_at');
  });

  await knex.schema.createTable('cards', (table) => {
    table.string('card_id', 16).primary();
    table.string('account_id', 11).notNullable();
    table.string('card_number', 16).notNullable();
    table.string('card_status', 20).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('account_id').references('account_id').inTable('accounts').onDelete('CASCADE');
    table.index('account_id');
    table.index('card_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cards');
  await knex.schema.dropTableIfExists('accounts');
}
