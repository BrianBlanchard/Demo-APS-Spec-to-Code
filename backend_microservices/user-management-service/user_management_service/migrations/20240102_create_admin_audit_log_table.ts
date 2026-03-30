import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('admin_audit_log', (table) => {
    table.bigIncrements('log_id').primary();
    table.uuid('admin_id').notNullable();
    table
      .enum('action', [
        'suspend_user',
        'reactivate_user',
        'delete_user',
        'change_role',
        'impersonate_user',
        'bulk_import',
        'bulk_export',
      ])
      .notNullable();
    table.uuid('target_user_id');
    table.jsonb('details_json');
    table.specificType('ip_address', 'INET').notNullable();
    table.timestamptz('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('admin_id');
    table.index('target_user_id');
    table.index('action');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('admin_audit_log');
}
