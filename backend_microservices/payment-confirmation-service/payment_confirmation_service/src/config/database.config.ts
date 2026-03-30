import { Knex } from 'knex';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  min: number;
  max: number;
}

export const getDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'payment_confirmation_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
});

export const getKnexConfig = (): Knex.Config => {
  const dbConfig = getDatabaseConfig();
  return {
    client: 'pg',
    connection: {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
    },
    pool: {
      min: dbConfig.min,
      max: dbConfig.max,
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  };
};
