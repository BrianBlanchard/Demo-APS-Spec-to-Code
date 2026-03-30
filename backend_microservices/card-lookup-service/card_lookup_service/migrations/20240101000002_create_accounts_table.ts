import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.string('accountId', 20).primary();
    table.string('customerId', 20).notNullable();
    table.enum('status', ['active', 'inactive', 'closed', 'suspended']).notNullable();
    table.decimal('currentBalance', 15, 2).notNullable().defaultTo(0);
    table.decimal('creditLimit', 15, 2).notNullable();
    table.decimal('availableCredit', 15, 2).notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    table.foreign('customerId').references('customers.customerId').onDelete('CASCADE');
    table.index(['customerId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('accounts');
}
