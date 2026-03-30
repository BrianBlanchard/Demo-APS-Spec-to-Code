/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('account_balances', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('account_id').notNullable().unique();
    table.decimal('current_balance', 15, 2).notNullable().defaultTo(0.00);
    table.decimal('purchase_balance', 15, 2).notNullable().defaultTo(0.00);
    table.decimal('cash_advance_balance', 15, 2).notNullable().defaultTo(0.00);
    table.decimal('last_interest_amount', 15, 2).nullable();
    table.date('last_interest_date').nullable();
    table.bigInteger('version').notNullable().defaultTo(0);
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('account_id').references('id').inTable('accounts').onDelete('CASCADE');
    table.index('account_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('account_balances');
};
