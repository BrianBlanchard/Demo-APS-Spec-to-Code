import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('reports', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('report_id', 50).notNullable().unique();
    table.string('report_type', 50).notNullable();
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date').notNullable();
    table.string('format', 10).notNullable();
    table.boolean('include_graphs').notNullable().defaultTo(false);
    table.timestamp('generated_at').notNullable();
    table.timestamp('expires_at').notNullable();
    table.string('download_url', 500).notNullable();
    table.string('status', 20).notNullable().defaultTo('pending');
    table.timestamps(true, true);

    table.index('report_id');
    table.index('report_type');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reports');
}
