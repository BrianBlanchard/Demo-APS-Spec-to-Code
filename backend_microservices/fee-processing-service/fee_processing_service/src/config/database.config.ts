import { Knex } from 'knex';
import knex from 'knex';
import { config } from './app.config';

const databaseConfig: Knex.Config = {
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
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
};

export const db = knex(databaseConfig);

export { databaseConfig };
