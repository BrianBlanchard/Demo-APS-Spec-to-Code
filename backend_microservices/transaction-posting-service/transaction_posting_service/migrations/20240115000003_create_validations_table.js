exports.up = function (knex) {
  return knex.schema.createTable('validations', (table) => {
    table.string('validation_id', 30).primary();
    table.string('authorization_code', 20).notNullable();
    table.string('card_number', 16).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('status', 20).notNullable().defaultTo('pending');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('card_number');
    table.index('status');
    table.index('authorization_code');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('validations');
};
