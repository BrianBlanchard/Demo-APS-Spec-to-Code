import { Knex } from 'knex';
import { config } from './config';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
  },
  pool: {
    min: config.database.pool.min,
    max: config.database.pool.max,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    extension: 'ts',
  },
};

export default knexConfig;
