import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('card_replacement_history', (table) => {
    table.uuid('replacement_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('original_card_number', 16).notNullable();
    table.string('replacement_card_number', 16).notNullable();
    table.string('replacement_reason', 50).notNullable();
    table.string('requested_by', 50).notNullable();
    table.timestamp('requested_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('expedited_shipping').notNullable().defaultTo(false);
    table.date('estimated_delivery').notNullable();
    table.string('delivery_line1', 200).notNullable();
    table.string('delivery_line2', 200);
    table.string('delivery_city', 100).notNullable();
    table.string('delivery_state', 50).notNullable();
    table.string('delivery_zip_code', 20).notNullable();

    table.foreign('original_card_number').references('cards.card_number').onDelete('CASCADE');
    table.foreign('replacement_card_number').references('cards.card_number').onDelete('CASCADE');

    table.index(['original_card_number']);
    table.index(['replacement_card_number']);
    table.index(['requested_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('card_replacement_history');
}
