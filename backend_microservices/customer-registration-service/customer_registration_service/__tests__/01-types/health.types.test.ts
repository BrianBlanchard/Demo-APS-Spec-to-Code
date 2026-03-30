import { HealthCheckResponse } from '../../src/types/health.types';

describe('Health Types', () => {
  describe('HealthCheckResponse Interface', () => {
    it('should accept valid health response with ok status', () => {
      const response: HealthCheckResponse = {
        status: 'ok',
        timestamp: '2024-01-15T10:30:00Z',
        uptime: 3600,
      };

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.uptime).toBe(3600);
    });

    it('should accept valid health response with error status', () => {
      const response: HealthCheckResponse = {
        status: 'error',
        timestamp: '2024-01-15T10:30:00Z',
        uptime: 3600,
      };

      expect(response.status).toBe('error');
    });

    it('should accept health response with optional checks', () => {
      const response: HealthCheckResponse = {
        status: 'ok',
        timestamp: '2024-01-15T10:30:00Z',
        uptime: 3600,
        checks: {
          database: 'ok',
          memory: 'ok',
        },
      };

      expect(response.checks).toBeDefined();
      expect(response.checks?.database).toBe('ok');
      expect(response.checks?.memory).toBe('ok');
    });

    it('should accept health response with failed checks', () => {
      const response: HealthCheckResponse = {
        status: 'error',
        timestamp: '2024-01-15T10:30:00Z',
        uptime: 3600,
        checks: {
          database: 'error',
        },
      };

      expect(response.checks?.database).toBe('error');
    });
  });
});
