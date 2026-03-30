import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cards', (table) => {
    table.string('cardNumber', 16).primary();
    table.string('accountId', 20).notNullable();
    table.string('customerId', 20).notNullable();
    table.string('embossedName', 100).notNullable();
    table.string('cvv', 3).notNullable();
    table.enum('status', ['active', 'inactive', 'blocked', 'expired']).notNullable();
    table.string('expirationDate', 5).notNullable(); // MM/YY
    table.string('issuedDate', 10).notNullable(); // YYYY-MM-DD
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    table.foreign('accountId').references('accounts.accountId').onDelete('CASCADE');
    table.foreign('customerId').references('customers.customerId').onDelete('CASCADE');
    table.index(['accountId']);
    table.index(['customerId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cards');
}
