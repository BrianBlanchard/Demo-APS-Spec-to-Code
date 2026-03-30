/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('interest_calculations', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('account_id').notNullable();
    table.date('calculation_date').notNullable();
    table.decimal('purchase_balance', 15, 2).notNullable();
    table.decimal('purchase_rate', 6, 3).notNullable();
    table.decimal('purchase_interest', 15, 2).notNullable();
    table.decimal('cash_advance_balance', 15, 2).notNullable();
    table.decimal('cash_advance_rate', 6, 3).notNullable();
    table.decimal('cash_advance_interest', 15, 2).notNullable();
    table.decimal('total_interest', 15, 2).notNullable();
    table.boolean('minimum_charge_applied').notNullable().defaultTo(false);
    table.boolean('applied_to_account').notNullable().defaultTo(false);
    table.timestamp('calculated_at').notNullable().defaultTo(knex.fn.now());
    table.string('calculated_by', 100).notNullable();

    table.foreign('account_id').references('id').inTable('accounts').onDelete('CASCADE');
    table.index('account_id');
    table.index('calculation_date');
    table.index('calculated_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('interest_calculations');
};
