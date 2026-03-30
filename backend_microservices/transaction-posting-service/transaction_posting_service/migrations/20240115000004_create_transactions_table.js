exports.up = function (knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.string('transaction_id', 16).primary();
    table.string('card_number', 16).notNullable();
    table.string('account_id', 11).notNullable();
    table.string('transaction_type', 2).notNullable();
    table.string('transaction_category', 4).notNullable();
    table.decimal('transaction_amount', 15, 2).notNullable();
    table.string('merchant_id', 10).notNullable();
    table.string('merchant_name', 50).notNullable();
    table.string('merchant_city', 50).notNullable();
    table.string('merchant_zip', 10).notNullable();
    table.string('transaction_source', 10).notNullable();
    table.string('transaction_description', 100).notNullable();
    table.timestamp('original_timestamp').notNullable();
    table.timestamp('posted_timestamp').notNullable().defaultTo(knex.fn.now());
    table.string('authorization_code', 20).notNullable();
    table.string('validation_id', 30).notNullable();
    table.string('status', 20).notNullable().defaultTo('posted');

    table.foreign('card_number').references('cards.card_number');
    table.foreign('account_id').references('accounts.account_id');
    table.foreign('validation_id').references('validations.validation_id');

    table.index('card_number');
    table.index('account_id');
    table.index('validation_id');
    table.index('status');
    table.index('posted_timestamp');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('transactions');
};
