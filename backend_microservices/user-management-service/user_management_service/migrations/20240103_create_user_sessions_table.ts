import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_sessions', (table) => {
    table.uuid('session_id').primary();
    table.uuid('user_id').notNullable();
    table.text('token').notNullable();
    table.timestamptz('expires_at').notNullable();
    table.timestamptz('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('expires_at');

    // Foreign key
    table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_sessions');
}
