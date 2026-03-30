import knex, { Knex } from 'knex';
import { config } from './index';

export const createDatabaseConnection = (): Knex => {
  return knex({
    client: 'pg',
    connection: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
    },
    pool: {
      min: config.database.poolMin,
      max: config.database.poolMax,
    },
    acquireConnectionTimeout: 10000,
  });
};

let dbInstance: Knex | null = null;

export const getDatabase = (): Knex => {
  if (!dbInstance) {
    dbInstance = createDatabaseConnection();
  }
  return dbInstance;
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
};
