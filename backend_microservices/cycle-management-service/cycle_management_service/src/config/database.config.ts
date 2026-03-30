import { Knex, knex } from 'knex';
import { envConfig } from './env.config';

export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: envConfig.database.host,
    port: envConfig.database.port,
    database: envConfig.database.name,
    user: envConfig.database.user,
    password: envConfig.database.password,
  },
  pool: {
    min: envConfig.database.poolMin,
    max: envConfig.database.poolMax,
  },
  migrations: {
    directory: './migrations',
    extension: 'ts',
    tableName: 'knex_migrations',
  },
};

export const db: Knex = knex(knexConfig);

export const testDbConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};
