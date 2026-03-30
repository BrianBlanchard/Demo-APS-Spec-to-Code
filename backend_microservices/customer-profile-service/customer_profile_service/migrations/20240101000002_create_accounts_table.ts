import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.string('account_id', 11).primary().notNullable();
    table.string('customer_id', 9).notNullable();
    table.enum('status', ['active', 'inactive', 'closed']).notNullable().defaultTo('active');
    table.decimal('balance', 12, 2).notNullable().defaultTo(0);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Foreign key
    table.foreign('customer_id').references('customers.customer_id').onDelete('CASCADE');

    // Indexes
    table.index('customer_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('accounts');
}
