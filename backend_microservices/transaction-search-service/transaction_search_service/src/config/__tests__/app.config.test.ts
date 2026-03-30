import { getAppConfig } from '../app.config';

describe('AppConfig - Configuration/Setup', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default configuration when no env vars set', () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.LOG_LEVEL;
    delete process.env.CORS_ALLOWED_ORIGINS;
    delete process.env.RATE_LIMIT_REQUESTS_PER_MINUTE;
    delete process.env.REQUEST_TIMEOUT;
    delete process.env.ELASTICSEARCH_NODE;
    delete process.env.ELASTICSEARCH_MAX_RESULTS;

    const config = getAppConfig();

    expect(config.nodeEnv).toBe('development');
    expect(config.port).toBe(3000);
    expect(config.logLevel).toBe('info');
    expect(config.corsAllowedOrigins).toBe('*');
    expect(config.rateLimitRequestsPerMinute).toBe(200);
    expect(config.requestTimeout).toBe(10000);
    expect(config.elasticsearchNode).toBe('http://localhost:9200');
    expect(config.elasticsearchMaxResults).toBe(10000);
  });

  it('should use environment variables when set', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';
    process.env.LOG_LEVEL = 'debug';
    process.env.CORS_ALLOWED_ORIGINS = 'https://example.com';
    process.env.RATE_LIMIT_REQUESTS_PER_MINUTE = '100';
    process.env.REQUEST_TIMEOUT = '5000';
    process.env.ELASTICSEARCH_NODE = 'http://es.example.com:9200';
    process.env.ELASTICSEARCH_MAX_RESULTS = '5000';

    const config = getAppConfig();

    expect(config.nodeEnv).toBe('production');
    expect(config.port).toBe(8080);
    expect(config.logLevel).toBe('debug');
    expect(config.corsAllowedOrigins).toBe('https://example.com');
    expect(config.rateLimitRequestsPerMinute).toBe(100);
    expect(config.requestTimeout).toBe(5000);
    expect(config.elasticsearchNode).toBe('http://es.example.com:9200');
    expect(config.elasticsearchMaxResults).toBe(5000);
  });

  it('should parse numeric values correctly', () => {
    process.env.PORT = '3001';
    process.env.RATE_LIMIT_REQUESTS_PER_MINUTE = '150';
    process.env.REQUEST_TIMEOUT = '15000';
    process.env.ELASTICSEARCH_MAX_RESULTS = '20000';

    const config = getAppConfig();

    expect(typeof config.port).toBe('number');
    expect(typeof config.rateLimitRequestsPerMinute).toBe('number');
    expect(typeof config.requestTimeout).toBe('number');
    expect(typeof config.elasticsearchMaxResults).toBe('number');
    expect(config.port).toBe(3001);
    expect(config.rateLimitRequestsPerMinute).toBe(150);
    expect(config.requestTimeout).toBe(15000);
    expect(config.elasticsearchMaxResults).toBe(20000);
  });

  it('should handle multiple CORS origins', () => {
    process.env.CORS_ALLOWED_ORIGINS = 'https://example1.com,https://example2.com';

    const config = getAppConfig();

    expect(config.corsAllowedOrigins).toBe('https://example1.com,https://example2.com');
  });
});
