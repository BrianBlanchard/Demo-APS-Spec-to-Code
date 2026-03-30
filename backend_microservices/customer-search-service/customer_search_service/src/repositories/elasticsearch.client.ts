import { Client } from '@elastic/elasticsearch';
import { config } from '../config';
import { logger } from '../utils/logger';

export class ElasticsearchClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: config.elasticsearch.node,
      requestTimeout: config.elasticsearch.requestTimeout,
    });
  }

  getClient(): Client {
    return this.client;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const health = await this.client.cluster.health();
      return health.status === 'green' || health.status === 'yellow';
    } catch (error) {
      logger.error({ error }, 'Elasticsearch health check failed');
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.close();
    logger.info('Elasticsearch client closed');
  }
}

export const elasticsearchClient = new ElasticsearchClient();
