import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_listings', (table) => {
    table.uuid('listing_id').primary();
    table.uuid('user_id').notNullable();
    table.string('title', 255).notNullable();
    table.text('description');
    table.boolean('is_hidden').notNullable().defaultTo(false);
    table.timestamptz('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamptz('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('is_hidden');

    // Foreign key
    table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_listings');
}
