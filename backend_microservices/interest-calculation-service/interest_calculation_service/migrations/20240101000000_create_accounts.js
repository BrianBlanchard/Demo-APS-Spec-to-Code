/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('accounts', (table) => {
    table.bigIncrements('id').primary();
    table.string('account_id', 11).notNullable().unique().index();
    table.enum('status', ['ACTIVE', 'SUSPENDED', 'CLOSED']).notNullable().defaultTo('ACTIVE');
    table.bigInteger('disclosure_group_id').nullable();
    table.timestamps(true, true);

    table.index('status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('accounts');
};
