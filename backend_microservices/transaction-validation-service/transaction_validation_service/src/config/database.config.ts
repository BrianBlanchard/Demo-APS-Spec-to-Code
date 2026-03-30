import { Knex, knex } from 'knex';
import { envConfig } from './env.config';

export class DatabaseConfig {
  private static instance: Knex | null = null;

  static getInstance(): Knex {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = knex({
        client: 'pg',
        connection: {
          host: envConfig.database.host,
          port: envConfig.database.port,
          database: envConfig.database.name,
          user: envConfig.database.user,
          password: envConfig.database.password,
          connectTimeout: envConfig.database.connectionTimeout,
        },
        pool: {
          min: envConfig.database.poolMin,
          max: envConfig.database.poolMax,
        },
        acquireConnectionTimeout: envConfig.database.connectionTimeout,
      });
    }
    return DatabaseConfig.instance;
  }

  static async closeConnection(): Promise<void> {
    if (DatabaseConfig.instance) {
      await DatabaseConfig.instance.destroy();
      DatabaseConfig.instance = null;
    }
  }
}

export const db = DatabaseConfig.getInstance();
