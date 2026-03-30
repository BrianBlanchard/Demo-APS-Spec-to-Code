import { readFileSync } from 'fs';
import { join } from 'path';
import { database } from '../src/database/db';

async function runMigrations(): Promise<void> {
  console.log('Running database migrations...');

  try {
    // Read and execute migration files in order
    const migrations = [
      '001_create_accounts_table.sql',
      '002_create_cards_table.sql',
    ];

    for (const migration of migrations) {
      console.log(`Executing migration: ${migration}`);
      const sql = readFileSync(join(__dirname, migration), 'utf8');
      await database.query(sql);
      console.log(`✓ ${migration} completed`);
    }

    console.log('✓ All migrations completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    await database.close();
  }
}

runMigrations();
