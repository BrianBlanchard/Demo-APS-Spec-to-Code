import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transaction_categories', (table) => {
    table.string('category_code', 4).primary();
    table.string('category_name', 100).notNullable();
    table.string('transaction_type', 2).notNullable();
    table.string('category_group', 50).notNullable();
    table.decimal('interest_rate', 5, 2).notNullable();
    table.boolean('rewards_eligible').notNullable().defaultTo(false);
    table.decimal('rewards_rate', 5, 2).notNullable().defaultTo(0);
    table.timestamps(true, true);
  });

  // Insert seed data
  await knex('transaction_categories').insert([
    {
      category_code: '5411',
      category_name: 'Grocery Stores',
      transaction_type: '01',
      category_group: 'retail',
      interest_rate: 18.99,
      rewards_eligible: true,
      rewards_rate: 1.5,
    },
    {
      category_code: '5812',
      category_name: 'Eating Places and Restaurants',
      transaction_type: '01',
      category_group: 'retail',
      interest_rate: 18.99,
      rewards_eligible: true,
      rewards_rate: 2.0,
    },
    {
      category_code: '5541',
      category_name: 'Service Stations',
      transaction_type: '01',
      category_group: 'retail',
      interest_rate: 18.99,
      rewards_eligible: true,
      rewards_rate: 3.0,
    },
    {
      category_code: '4900',
      category_name: 'Utilities',
      transaction_type: '01',
      category_group: 'services',
      interest_rate: 18.99,
      rewards_eligible: false,
      rewards_rate: 0.0,
    },
    {
      category_code: '6011',
      category_name: 'Cash Advance',
      transaction_type: '02',
      category_group: 'cash',
      interest_rate: 24.99,
      rewards_eligible: false,
      rewards_rate: 0.0,
    },
    {
      category_code: '9999',
      category_name: 'Other',
      transaction_type: '01',
      category_group: 'other',
      interest_rate: 19.99,
      rewards_eligible: false,
      rewards_rate: 0.0,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transaction_categories');
}
