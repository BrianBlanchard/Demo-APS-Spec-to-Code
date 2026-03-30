exports.up = function (knex) {
  return knex.schema.createTable('accounts', (table) => {
    table.char('account_id', 11).primary();
    table.decimal('credit_limit', 15, 2).notNullable();
    table.decimal('current_balance', 15, 2).notNullable().defaultTo(0);
    table.decimal('available_cash_credit', 15, 2).notNullable();
    table.string('status', 20).notNullable().defaultTo('active');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('accounts');
};
