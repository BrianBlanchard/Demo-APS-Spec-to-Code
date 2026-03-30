import { Knex, knex } from 'knex';
import { config } from './config';

let dbInstance: Knex | null = null;

export function getDatabase(): Knex {
  if (!dbInstance) {
    dbInstance = knex({
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
      acquireConnectionTimeout: 10000,
    });
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
}
