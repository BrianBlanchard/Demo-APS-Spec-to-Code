import knex, { Knex } from 'knex';
import config from '../config';
import logger from '../utils/logger';

let db: Knex | null = null;

export function getDatabase(): Knex {
  if (!db) {
    db = knex({
      client: 'postgresql',
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
    });

    logger.info('Database connection established');
  }

  return db;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const database = getDatabase();
    await database.raw('SELECT 1');
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection failed');
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
    logger.info('Database connection closed');
  }
}
