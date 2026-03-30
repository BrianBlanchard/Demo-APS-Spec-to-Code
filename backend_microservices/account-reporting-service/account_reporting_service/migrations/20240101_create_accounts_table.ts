import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.uuid('account_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.enum('status', ['active', 'suspended', 'closed']).notNullable().defaultTo('active');
    table.decimal('balance', 15, 2).notNullable().defaultTo(0);
    table.decimal('credit_limit', 15, 2).notNullable().defaultTo(0);
    table.timestamp('last_activity_date').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('accounts');
}
