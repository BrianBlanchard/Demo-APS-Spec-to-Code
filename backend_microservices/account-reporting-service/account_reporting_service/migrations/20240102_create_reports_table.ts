import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('reports', (table) => {
    table.string('report_id', 50).primary();
    table
      .enum('report_type', [
        'account_status',
        'credit_utilization',
        'delinquency',
        'monthly_statement',
      ])
      .notNullable();
    table.date('as_of_date').notNullable();
    table.enum('format', ['csv', 'json', 'pdf']).notNullable();
    table.integer('total_accounts').notNullable().defaultTo(0);
    table.integer('active_accounts').notNullable().defaultTo(0);
    table.integer('suspended_accounts').notNullable().defaultTo(0);
    table.integer('closed_accounts').notNullable().defaultTo(0);
    table.text('download_url').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index('report_type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reports');
}
