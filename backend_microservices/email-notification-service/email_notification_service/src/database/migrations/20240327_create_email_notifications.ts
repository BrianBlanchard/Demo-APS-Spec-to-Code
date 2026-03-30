import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('email_notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('notification_id', 100).notNullable().unique();
    table.string('to', 255).notNullable();
    table.string('template_id', 100).notNullable();
    table.jsonb('template_data').notNullable();
    table.string('priority', 20).notNullable().defaultTo('normal');
    table.string('status', 20).notNullable().defaultTo('queued');
    table.timestamp('sent_at').nullable();
    table.integer('retry_count').notNullable().defaultTo(0);
    table.text('error_message').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('notification_id');
    table.index('to');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('email_notifications');
}
