import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('audit_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('customer_id', 9).notNullable();
    table.string('field_name', 50).notNullable();
    table.text('old_value').nullable();
    table.text('new_value').nullable();
    table.timestamp('changed_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.string('changed_by', 8).notNullable();
    table.inet('ip_address').notNullable();
    table.string('trace_id', 36).nullable();

    // Foreign key
    table.foreign('customer_id').references('customers.customer_id').onDelete('CASCADE');

    // Indexes
    table.index('customer_id');
    table.index('changed_at');
    table.index('changed_by');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
