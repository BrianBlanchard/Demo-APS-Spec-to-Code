import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('event_type', 100).notNullable();
    table.string('entity_type', 50).notNullable();
    table.string('entity_id', 100).notNullable();
    table.string('user_id', 50).notNullable();
    table.string('trace_id', 100).notNullable();
    table.jsonb('event_data').notNullable();
    table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());

    table.index(['event_type']);
    table.index(['entity_type', 'entity_id']);
    table.index(['user_id']);
    table.index(['trace_id']);
    table.index(['timestamp']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
