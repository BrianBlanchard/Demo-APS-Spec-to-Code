import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('account_status_history', (table) => {
    table.uuid('history_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('account_id', 11).notNullable();
    table.string('previous_status', 20).notNullable();
    table.string('new_status', 20).notNullable();
    table.string('reason_code', 50).notNullable();
    table.text('notes').nullable();
    table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now());
    table.string('changed_by', 8).notNullable();
    table.boolean('notify_customer').notNullable().defaultTo(false);
    table.inet('ip_address').notNullable();

    table.foreign('account_id').references('account_id').inTable('accounts').onDelete('CASCADE');
    table.index('account_id');
    table.index('changed_at');
    table.index('new_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('account_status_history');
}
