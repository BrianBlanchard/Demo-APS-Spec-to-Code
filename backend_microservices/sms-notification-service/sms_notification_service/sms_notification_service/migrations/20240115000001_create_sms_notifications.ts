import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sms_notifications', (table) => {
    table.increments('id').primary();
    table.string('notification_id', 50).notNullable().unique();
    table.string('to', 20).notNullable();
    table.string('message_type', 50).notNullable();
    table.text('message').notNullable();
    table.string('priority', 20).notNullable();
    table.string('status', 20).notNullable();
    table.string('message_id', 100).nullable();
    table.timestamp('sent_at').nullable();
    table.text('failure_reason').nullable();
    table.integer('retry_count').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('notification_id');
    table.index('to');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sms_notifications');
}
