exports.up = function (knex) {
  return knex.schema.createTable('cards', (table) => {
    table.string('card_number', 16).primary();
    table.string('account_id', 11).notNullable();
    table.string('status', 20).notNullable().defaultTo('active');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('account_id').references('accounts.account_id');
    table.index('account_id');
    table.index('status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('cards');
};
