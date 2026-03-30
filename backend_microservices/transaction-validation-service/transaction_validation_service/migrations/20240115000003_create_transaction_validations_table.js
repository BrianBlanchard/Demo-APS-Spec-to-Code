exports.up = function (knex) {
  return knex.schema.createTable('transaction_validations', (table) => {
    table.string('validation_id', 30).primary();
    table.char('card_number', 16).notNullable();
    table.char('account_id', 11).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('validation_result', 20).notNullable();
    table.string('decline_reason', 50).nullable();
    table.string('authorization_code', 20).nullable();
    table.string('merchant_id', 10).notNullable();
    table.char('transaction_type', 2).notNullable();
    table.timestamp('validated_at').notNullable().defaultTo(knex.fn.now());
    table.integer('response_time_ms').notNullable();
    table.boolean('cvv_provided').notNullable();
    table.boolean('cvv_match').nullable();

    table.index('card_number');
    table.index('account_id');
    table.index('validated_at');
    table.index(['card_number', 'merchant_id', 'amount', 'validated_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('transaction_validations');
};
