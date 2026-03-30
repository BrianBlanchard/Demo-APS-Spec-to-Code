import type { Knex } from 'knex';
import config from '../config';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
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
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
  production: {
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
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
};

export default knexConfig;
