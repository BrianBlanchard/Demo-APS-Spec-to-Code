import knex, { Knex } from 'knex';
import { config } from './config';

let dbInstance: Knex | null = null;

export const getDatabase = (): Knex => {
  if (!dbInstance) {
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
  }
  return dbInstance;
};

export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
};
