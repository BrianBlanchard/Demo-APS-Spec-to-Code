import type { Knex } from 'knex';
import { config } from './config';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
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
    migrations: {
      directory: '../migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'postgresql',
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
    migrations: {
      directory: '../migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
};

export default knexConfig;
