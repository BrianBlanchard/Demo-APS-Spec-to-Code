import { Knex } from 'knex';
import { knexConfig } from './database.config';

const config: { [key: string]: Knex.Config } = {
  development: knexConfig,
  staging: knexConfig,
  production: knexConfig,
};

export default config;
