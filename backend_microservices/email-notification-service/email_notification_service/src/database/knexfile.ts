import type { Knex } from 'knex';
import { databaseConfig } from '../config/app.config';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.database,
    user: databaseConfig.user,
    password: databaseConfig.password,
  },
  pool: {
    min: databaseConfig.pool.min,
    max: databaseConfig.pool.max,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
    extension: 'ts',
  },
};

export default config;
