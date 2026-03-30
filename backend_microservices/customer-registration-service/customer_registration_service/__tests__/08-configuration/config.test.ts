import { getAppConfig } from '../../src/config/app.config';

describe('Configuration Tests', () => {
  describe('getAppConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return configuration with default values', () => {
      delete process.env.PORT;
      delete process.env.NODE_ENV;
      delete process.env.CORS_ORIGIN;

      const config = getAppConfig();

      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe('development');
      expect(config.corsOrigin).toBe('*');
    });

    it('should use environment variables when provided', () => {
      process.env.PORT = '4000';
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://example.com';
      process.env.ENCRYPTION_KEY = 'test-encryption-key';
      process.env.JWT_SECRET = 'test-jwt-secret';

      const config = getAppConfig();

      expect(config.port).toBe(4000);
      expect(config.nodeEnv).toBe('production');
      expect(config.corsOrigin).toBe('https://example.com');
      expect(config.encryptionKey).toBe('test-encryption-key');
      expect(config.jwtSecret).toBe('test-jwt-secret');
    });

    it('should include credit bureau configuration', () => {
      process.env.CREDIT_BUREAU_API_URL = 'https://bureau.test.com';
      process.env.CREDIT_BUREAU_API_KEY = 'test-api-key';
      process.env.CREDIT_BUREAU_TIMEOUT = '10000';

      const config = getAppConfig();

      expect(config.creditBureauApiUrl).toBe('https://bureau.test.com');
      expect(config.creditBureauApiKey).toBe('test-api-key');
      expect(config.creditBureauTimeout).toBe(10000);
    });

    it('should use default credit bureau configuration', () => {
      delete process.env.CREDIT_BUREAU_API_URL;
      delete process.env.CREDIT_BUREAU_API_KEY;
      delete process.env.CREDIT_BUREAU_TIMEOUT;

      const config = getAppConfig();

      expect(config.creditBureauApiUrl).toBe('https://api.creditbureau.com');
      expect(config.creditBureauApiKey).toBe('');
      expect(config.creditBureauTimeout).toBe(5000);
    });

    it('should parse port as number', () => {
      process.env.PORT = '8080';

      const config = getAppConfig();

      expect(typeof config.port).toBe('number');
      expect(config.port).toBe(8080);
    });

    it('should parse timeout as number', () => {
      process.env.CREDIT_BUREAU_TIMEOUT = '15000';

      const config = getAppConfig();

      expect(typeof config.creditBureauTimeout).toBe('number');
      expect(config.creditBureauTimeout).toBe(15000);
    });

    it('should include all required configuration fields', () => {
      const config = getAppConfig();

      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('nodeEnv');
      expect(config).toHaveProperty('corsOrigin');
      expect(config).toHaveProperty('encryptionKey');
      expect(config).toHaveProperty('jwtSecret');
      expect(config).toHaveProperty('creditBureauApiUrl');
      expect(config).toHaveProperty('creditBureauApiKey');
      expect(config).toHaveProperty('creditBureauTimeout');
    });

    it('should handle production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://api.example.com';

      const config = getAppConfig();

      expect(config.nodeEnv).toBe('production');
      expect(config.corsOrigin).toBe('https://api.example.com');
    });

    it('should handle development environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.CORS_ORIGIN = '*';

      const config = getAppConfig();

      expect(config.nodeEnv).toBe('development');
      expect(config.corsOrigin).toBe('*');
    });
  });
});
