import knex, { Knex } from 'knex';
import { config } from './index';

let dbInstance: Knex | null = null;

export function initDatabase(): Knex {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = knex({
    client: 'pg',
    connection: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
    },
    pool: {
      min: config.database.poolMin,
      max: config.database.poolMax,
    },
    acquireConnectionTimeout: 10000,
  });

  return dbInstance;
}

export function getDatabase(): Knex {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
}
