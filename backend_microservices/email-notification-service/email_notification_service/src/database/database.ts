import knex, { Knex } from 'knex';
import { databaseConfig } from '../config/app.config';
import { logger } from '../config/logger.config';

let dbInstance: Knex | null = null;

export function getDatabase(): Knex {
  if (!dbInstance) {
    dbInstance = knex({
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
    });

    logger.info('Database connection initialized');
  }

  return dbInstance;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
    logger.info('Database connection closed');
  }
}
