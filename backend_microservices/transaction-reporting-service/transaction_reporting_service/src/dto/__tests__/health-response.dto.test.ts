import { describe, it, expect } from '@jest/globals';
import { HealthResponseSchema, HealthStatusEnum } from '../health-response.dto';

describe('HealthResponseDto', () => {
  const validHealth = {
    status: 'healthy',
    timestamp: '2024-01-15T10:30:00Z',
    uptime: 3600.5,
    database: {
      connected: true,
    },
  };

  describe('HealthStatusEnum', () => {
    it('should accept valid health statuses', () => {
      expect(() => HealthStatusEnum.parse('healthy')).not.toThrow();
      expect(() => HealthStatusEnum.parse('unhealthy')).not.toThrow();
    });

    it('should reject invalid health statuses', () => {
      expect(() => HealthStatusEnum.parse('degraded')).toThrow();
      expect(() => HealthStatusEnum.parse('unknown')).toThrow();
      expect(() => HealthStatusEnum.parse('')).toThrow();
    });
  });

  describe('valid health responses', () => {
    it('should accept valid health response', () => {
      expect(() => HealthResponseSchema.parse(validHealth)).not.toThrow();
    });

    it('should accept unhealthy status', () => {
      const unhealthy = { ...validHealth, status: 'unhealthy', database: { connected: false } };
      expect(() => HealthResponseSchema.parse(unhealthy)).not.toThrow();
    });

    it('should accept zero uptime', () => {
      const zeroUptime = { ...validHealth, uptime: 0 };
      expect(() => HealthResponseSchema.parse(zeroUptime)).not.toThrow();
    });

    it('should accept large uptime values', () => {
      const largeUptime = { ...validHealth, uptime: 999999.99 };
      expect(() => HealthResponseSchema.parse(largeUptime)).not.toThrow();
    });
  });

  describe('field validation', () => {
    it('should reject missing status', () => {
      const { status, ...missing } = validHealth;
      expect(() => HealthResponseSchema.parse(missing)).toThrow();
    });

    it('should reject missing timestamp', () => {
      const { timestamp, ...missing } = validHealth;
      expect(() => HealthResponseSchema.parse(missing)).toThrow();
    });

    it('should reject missing uptime', () => {
      const { uptime, ...missing } = validHealth;
      expect(() => HealthResponseSchema.parse(missing)).toThrow();
    });

    it('should reject missing database', () => {
      const { database, ...missing } = validHealth;
      expect(() => HealthResponseSchema.parse(missing)).toThrow();
    });

    it('should reject invalid status value', () => {
      const invalid = { ...validHealth, status: 'invalid' };
      expect(() => HealthResponseSchema.parse(invalid)).toThrow();
    });

    it('should reject invalid timestamp format', () => {
      const invalid = { ...validHealth, timestamp: '2024-01-15' };
      expect(() => HealthResponseSchema.parse(invalid)).toThrow();
    });

    it('should reject string uptime', () => {
      const invalid = { ...validHealth, uptime: '3600' };
      expect(() => HealthResponseSchema.parse(invalid)).toThrow();
    });

    it('should reject missing database.connected', () => {
      const invalid = { ...validHealth, database: {} };
      expect(() => HealthResponseSchema.parse(invalid)).toThrow();
    });

    it('should reject non-boolean database.connected', () => {
      const invalid = { ...validHealth, database: { connected: 'true' } };
      expect(() => HealthResponseSchema.parse(invalid)).toThrow();
    });
  });
});
