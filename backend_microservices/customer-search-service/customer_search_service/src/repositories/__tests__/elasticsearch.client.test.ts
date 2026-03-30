import { Client } from '@elastic/elasticsearch';
import { ElasticsearchClient } from '../elasticsearch.client';
import { logger } from '../../utils/logger';

jest.mock('@elastic/elasticsearch');
jest.mock('../../utils/logger');
jest.mock('../../config', () => ({
  config: {
    elasticsearch: {
      node: 'http://localhost:9200',
      requestTimeout: 2000,
    },
  },
}));

describe('ElasticsearchClient', () => {
  let elasticsearchClient: ElasticsearchClient;
  let mockClient: any;
  let mockHealthCheck: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockHealthCheck = jest.fn();
    mockClient = {
      cluster: {
        health: mockHealthCheck,
      },
      close: jest.fn(),
    };

    (Client as jest.MockedClass<typeof Client>).mockImplementation(() => mockClient);

    elasticsearchClient = new ElasticsearchClient();
  });

  describe('constructor', () => {
    it('should create an Elasticsearch client with correct configuration', () => {
      expect(Client).toHaveBeenCalledWith({
        node: 'http://localhost:9200',
        requestTimeout: 2000,
      });
    });

    it('should create client instance only once', () => {
      expect(Client).toHaveBeenCalledTimes(1);
    });
  });

  describe('getClient', () => {
    it('should return the Elasticsearch client instance', () => {
      const client = elasticsearchClient.getClient();

      expect(client).toBe(mockClient);
    });

    it('should return the same client instance on multiple calls', () => {
      const client1 = elasticsearchClient.getClient();
      const client2 = elasticsearchClient.getClient();

      expect(client1).toBe(client2);
    });
  });

  describe('healthCheck', () => {
    it('should return true when cluster status is green', async () => {
      mockHealthCheck.mockResolvedValue({
        status: 'green',
      } as any);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(true);
      expect(mockHealthCheck).toHaveBeenCalled();
    });

    it('should return true when cluster status is yellow', async () => {
      mockHealthCheck.mockResolvedValue({
        status: 'yellow',
      } as any);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should return false when cluster status is red', async () => {
      mockHealthCheck.mockResolvedValue({
        status: 'red',
      } as any);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('should return false and log error when health check fails', async () => {
      const testError = new Error('Connection refused');
      mockHealthCheck.mockRejectedValue(testError);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        { error: testError },
        'Elasticsearch health check failed'
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockHealthCheck.mockRejectedValue(timeoutError);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        { error: timeoutError },
        'Elasticsearch health check failed'
      );
    });

    it('should not throw error on health check failure', async () => {
      mockHealthCheck.mockRejectedValue(new Error('Network error'));

      await expect(elasticsearchClient.healthCheck()).resolves.toBe(false);
    });

    it('should handle missing status field gracefully', async () => {
      mockHealthCheck.mockResolvedValue({} as any);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('should handle unexpected status values', async () => {
      mockHealthCheck.mockResolvedValue({
        status: 'unknown',
      } as any);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('close', () => {
    it('should close the Elasticsearch client', async () => {
      mockClient.close.mockResolvedValue(undefined);

      await elasticsearchClient.close();

      expect(mockClient.close).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Elasticsearch client closed');
    });

    it('should handle close errors', async () => {
      const testError = new Error('Close failed');
      mockClient.close.mockRejectedValue(testError);

      await expect(elasticsearchClient.close()).rejects.toThrow('Close failed');
    });

    it('should log info message when close succeeds', async () => {
      mockClient.close.mockResolvedValue(undefined);

      await elasticsearchClient.close();

      expect(logger.info).toHaveBeenCalledWith('Elasticsearch client closed');
    });
  });

  describe('integration scenarios', () => {
    it('should support multiple health checks in sequence', async () => {
      mockHealthCheck
        .mockResolvedValueOnce({ status: 'green' } as any)
        .mockResolvedValueOnce({ status: 'yellow' } as any)
        .mockResolvedValueOnce({ status: 'red' } as any);

      const result1 = await elasticsearchClient.healthCheck();
      const result2 = await elasticsearchClient.healthCheck();
      const result3 = await elasticsearchClient.healthCheck();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(false);
      expect(mockHealthCheck).toHaveBeenCalledTimes(3);
    });

    it('should support concurrent health checks', async () => {
      mockHealthCheck.mockResolvedValue({
        status: 'green',
      } as any);

      const checks = [
        elasticsearchClient.healthCheck(),
        elasticsearchClient.healthCheck(),
        elasticsearchClient.healthCheck(),
      ];

      const results = await Promise.all(checks);

      expect(results).toEqual([true, true, true]);
      expect(mockHealthCheck).toHaveBeenCalledTimes(3);
    });

    it('should handle health check after close attempt', async () => {
      mockClient.close.mockResolvedValue(undefined);
      mockHealthCheck.mockResolvedValue({
        status: 'green',
      } as any);

      await elasticsearchClient.close();
      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(true);
    });
  });

  describe('client usage', () => {
    it('should allow direct client access for custom operations', () => {
      const client = elasticsearchClient.getClient();

      expect(client).toBeDefined();
      expect(client.cluster).toBeDefined();
      expect(client.close).toBeDefined();
    });

    it('should maintain client reference across operations', async () => {
      const client1 = elasticsearchClient.getClient();

      mockHealthCheck.mockResolvedValue({
        status: 'green',
      } as any);

      await elasticsearchClient.healthCheck();

      const client2 = elasticsearchClient.getClient();

      expect(client1).toBe(client2);
    });
  });

  describe('error scenarios', () => {
    it('should handle network errors during health check', async () => {
      const networkError = new Error('ECONNREFUSED');
      mockHealthCheck.mockRejectedValue(networkError);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        { error: networkError },
        'Elasticsearch health check failed'
      );
    });

    it('should handle authentication errors during health check', async () => {
      const authError = new Error('Unauthorized');
      mockHealthCheck.mockRejectedValue(authError);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('should handle null/undefined errors', async () => {
      mockHealthCheck.mockRejectedValue(null);

      const isHealthy = await elasticsearchClient.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('configuration validation', () => {
    it('should use configured node URL', () => {
      const constructorCall = (Client as jest.MockedClass<typeof Client>).mock.calls[0][0];

      expect(constructorCall).toEqual({
        node: 'http://localhost:9200',
        requestTimeout: 2000,
      });
    });

    it('should use configured request timeout', () => {
      const constructorCall = (Client as jest.MockedClass<typeof Client>).mock.calls[0][0];

      expect(constructorCall.requestTimeout).toBe(2000);
    });
  });

  describe('module exports', () => {
    it('should export elasticsearchClient singleton', () => {
      const { elasticsearchClient: exportedClient } = require('../elasticsearch.client');

      expect(exportedClient).toBeInstanceOf(ElasticsearchClient);
    });

    it('should export ElasticsearchClient class', () => {
      const { ElasticsearchClient: ExportedClass } = require('../elasticsearch.client');

      expect(ExportedClass).toBeDefined();
      expect(new ExportedClass()).toBeInstanceOf(ElasticsearchClient);
    });
  });

  describe('lifecycle', () => {
    it('should support initialization, operation, and cleanup lifecycle', async () => {
      mockHealthCheck.mockResolvedValue({
        status: 'green',
      } as any);
      mockClient.close.mockResolvedValue(undefined);

      // Initialize (constructor already called)
      const client = elasticsearchClient.getClient();
      expect(client).toBeDefined();

      // Operate
      const isHealthy = await elasticsearchClient.healthCheck();
      expect(isHealthy).toBe(true);

      // Cleanup
      await elasticsearchClient.close();
      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});
