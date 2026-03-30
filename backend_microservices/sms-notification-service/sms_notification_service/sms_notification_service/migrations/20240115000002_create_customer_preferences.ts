import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('customer_preferences', (table) => {
    table.increments('id').primary();
    table.string('phone_number', 20).notNullable().unique();
    table.boolean('sms_opt_in').notNullable().defaultTo(true);
    table.boolean('email_opt_in').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('phone_number');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('customer_preferences');
}
