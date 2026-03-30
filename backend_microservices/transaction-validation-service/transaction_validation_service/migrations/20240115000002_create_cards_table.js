exports.up = function (knex) {
  return knex.schema.createTable('cards', (table) => {
    table.char('card_number', 16).primary();
    table.char('account_id', 11).notNullable();
    table.char('cvv', 3).notNullable();
    table.timestamp('expiration_date').notNullable();
    table.string('status', 20).notNullable().defaultTo('active');
    table.integer('daily_transaction_limit').notNullable().defaultTo(50);
    table.integer('daily_transaction_count').notNullable().defaultTo(0);
    table.timestamp('last_transaction_date').nullable();
    table.integer('cvv_failure_count').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('account_id').references('accounts.account_id');
    table.index('account_id');
    table.index('status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('cards');
};
