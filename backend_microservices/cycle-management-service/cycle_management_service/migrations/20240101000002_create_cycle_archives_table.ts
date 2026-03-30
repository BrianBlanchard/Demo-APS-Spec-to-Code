import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cycle_archives', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
    table.string('billing_cycle', 7).notNullable();
    table.decimal('cycle_credit', 15, 2).notNullable().defaultTo(0.0);
    table.decimal('cycle_debit', 15, 2).notNullable().defaultTo(0.0);
    table.decimal('interest_charged', 15, 2).notNullable().defaultTo(0.0);
    table.decimal('fees_charged', 15, 2).notNullable().defaultTo(0.0);
    table.date('processing_date').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index('account_id');
    table.index('billing_cycle');
    table.index('processing_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cycle_archives');
}
