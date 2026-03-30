import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('email_templates').insert([
    {
      template_id: 'payment_confirmation',
      subject: 'Payment Confirmation - {{confirmationNumber}}',
      html_content:
        '<html>' +
        '<body>' +
        '<h1>Payment Confirmation</h1>' +
        '<p>Dear {{customerName}},</p>' +
        '<p>Your payment of ${{paymentAmount}} has been successfully processed.</p>' +
        '<p><strong>Confirmation Number:</strong> {{confirmationNumber}}</p>' +
        '<p><strong>Payment Date:</strong> {{paymentDate}}</p>' +
        '<p>Thank you for your business!</p>' +
        '</body>' +
        '</html>',
      text_content:
        'Payment Confirmation\n\n' +
        'Dear {{customerName}},\n\n' +
        'Your payment of ${{paymentAmount}} has been successfully processed.\n\n' +
        'Confirmation Number: {{confirmationNumber}}\n' +
        'Payment Date: {{paymentDate}}\n\n' +
        'Thank you for your business!',
      required_fields: JSON.stringify(['customerName', 'paymentAmount', 'confirmationNumber', 'paymentDate']),
    },
    {
      template_id: 'transaction_alert',
      subject: 'Transaction Alert',
      html_content:
        '<html>' +
        '<body>' +
        '<h1>Transaction Alert</h1>' +
        '<p>Dear {{customerName}},</p>' +
        '<p>A transaction of ${{transactionAmount}} was made on your account.</p>' +
        '<p><strong>Date:</strong> {{transactionDate}}</p>' +
        '</body>' +
        '</html>',
      text_content:
        'Transaction Alert\n\n' +
        'Dear {{customerName}},\n\n' +
        'A transaction of ${{transactionAmount}} was made on your account.\n\n' +
        'Date: {{transactionDate}}',
      required_fields: JSON.stringify(['customerName', 'transactionAmount', 'transactionDate']),
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex('email_templates').whereIn('template_id', [
    'payment_confirmation',
    'transaction_alert',
  ]).delete();
}
