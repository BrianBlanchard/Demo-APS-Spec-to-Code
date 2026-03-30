import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notification_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('customer_id').notNullable().unique();
    table.boolean('email_enabled').notNullable().defaultTo(true);
    table.boolean('sms_enabled').notNullable().defaultTo(false);

    // Transaction alerts
    table.boolean('transaction_alerts_enabled').notNullable().defaultTo(true);
    table.decimal('transaction_alerts_threshold', 10, 2).notNullable().defaultTo(0);
    table.jsonb('transaction_alerts_channels').notNullable().defaultTo('["email"]');

    // Payment confirmations
    table.boolean('payment_confirmations_enabled').notNullable().defaultTo(true);
    table.jsonb('payment_confirmations_channels').notNullable().defaultTo('["email"]');

    // Monthly statements
    table.boolean('monthly_statements_enabled').notNullable().defaultTo(true);
    table.jsonb('monthly_statements_channels').notNullable().defaultTo('["email"]');

    // Marketing emails
    table.boolean('marketing_emails_enabled').notNullable().defaultTo(false);

    table.timestamps(true, true);
    table.index('customer_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notification_preferences');
}
