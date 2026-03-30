import knex, { Knex } from 'knex';
import knexConfig from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

let db: Knex;

export function getDatabase(): Knex {
  if (!db) {
    db = knex(config);
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const database = getDatabase();
    await database.raw('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}
