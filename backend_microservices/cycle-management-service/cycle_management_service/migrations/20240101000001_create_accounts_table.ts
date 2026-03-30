import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('account_number', 50).notNullable().unique();
    table.decimal('current_cycle_credit', 15, 2).notNullable().defaultTo(0.0);
    table.decimal('current_cycle_debit', 15, 2).notNullable().defaultTo(0.0);
    table.enum('status', ['ACTIVE', 'CLOSED', 'SUSPENDED']).notNullable().defaultTo('ACTIVE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.index('account_number');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('accounts');
}
