import knex, { Knex } from 'knex';
import { config } from './config';

export const createDatabaseConnection = (): Knex => {
  return knex({
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
