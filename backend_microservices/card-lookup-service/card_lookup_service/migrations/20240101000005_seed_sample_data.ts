import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Insert sample customer
  await knex('customers').insert({
    customerId: '123456789',
    firstName: 'John',
    lastName: 'Anderson',
    email: 'john.anderson@example.com',
    phone: '+1-555-0100',
  });

  // Insert sample account
  await knex('accounts').insert({
    accountId: '12345678901',
    customerId: '123456789',
    status: 'active',
    currentBalance: 2450.75,
    creditLimit: 5000.0,
    availableCredit: 2549.25,
  });

  // Insert sample card
  await knex('cards').insert({
    cardNumber: '4532123456781234',
    accountId: '12345678901',
    customerId: '123456789',
    embossedName: 'JOHN M ANDERSON',
    cvv: '123',
    status: 'active',
    expirationDate: '01/27',
    issuedDate: '2024-01-15',
  });

  // Insert sample transactions
  await knex('transactions').insert([
    {
      transactionId: '1234567890123456',
      cardNumber: '4532123456781234',
      accountId: '12345678901',
      transactionDate: new Date('2024-01-15'),
      merchantName: 'AMAZON.COM',
      amount: 125.5,
      currency: 'USD',
      status: 'completed',
    },
    {
      transactionId: '1234567890123457',
      cardNumber: '4532123456781234',
      accountId: '12345678901',
      transactionDate: new Date('2024-01-14'),
      merchantName: 'STARBUCKS',
      amount: 5.75,
      currency: 'USD',
      status: 'completed',
    },
    {
      transactionId: '1234567890123458',
      cardNumber: '4532123456781234',
      accountId: '12345678901',
      transactionDate: new Date('2024-01-13'),
      merchantName: 'WALMART',
      amount: 87.32,
      currency: 'USD',
      status: 'completed',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex('transactions').del();
  await knex('cards').del();
  await knex('accounts').del();
  await knex('customers').del();
}
