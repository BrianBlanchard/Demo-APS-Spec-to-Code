exports.up = function (knex) {
  return knex.schema.createTable('accounts', (table) => {
    table.string('account_id', 11).primary();
    table.decimal('current_balance', 15, 2).notNullable().defaultTo(0);
    table.decimal('available_credit', 15, 2).notNullable().defaultTo(0);
    table.decimal('credit_limit', 15, 2).notNullable().defaultTo(5000);
    table.decimal('current_cycle_debit', 15, 2).notNullable().defaultTo(0);
    table.decimal('current_cycle_credit', 15, 2).notNullable().defaultTo(0);
    table.timestamp('last_transaction_date').nullable();
    table.string('status', 20).notNullable().defaultTo('active');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('accounts');
};
