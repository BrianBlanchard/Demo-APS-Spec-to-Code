import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('user_id').primary();
    table.string('email', 255).notNullable().unique();
    table.enum('status', ['active', 'suspended', 'deleted']).notNullable().defaultTo('active');
    table.enum('suspension_reason', [
      'fraud',
      'policy_violation',
      'spam',
      'inappropriate_content',
      'security_concern',
      'other',
    ]);
    table.text('suspension_notes');
    table.timestamptz('suspension_expires_at');
    table.timestamptz('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamptz('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('email');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
