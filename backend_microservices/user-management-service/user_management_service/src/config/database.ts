import { Knex } from 'knex';
import knex from 'knex';
import { config } from './config';
import { logger } from './logger';

let dbInstance: Knex | null = null;

export const createDatabaseConnection = (): Knex => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = knex({
    client: 'pg',
    connection: {
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
    },
    pool: {
      min: config.db.poolMin,
      max: config.db.poolMax,
    },
    acquireConnectionTimeout: 10000,
  });

  logger.info('Database connection pool created');
  return dbInstance;
};

export const getDatabaseConnection = (): Knex => {
  if (!dbInstance) {
    return createDatabaseConnection();
  }
  return dbInstance;
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
    logger.info('Database connection pool closed');
  }
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const db = getDatabaseConnection();
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
};
