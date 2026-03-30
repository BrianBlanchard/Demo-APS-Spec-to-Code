export interface AppConfig {
  nodeEnv: string;
  port: number;
  logLevel: string;
  corsAllowedOrigins: string;
  rateLimitRequestsPerMinute: number;
  requestTimeout: number;
  elasticsearchNode: string;
  elasticsearchMaxResults: number;
}

export function getAppConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS || '*',
    rateLimitRequestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '200', 10),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '10000', 10),
    elasticsearchNode: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    elasticsearchMaxResults: parseInt(process.env.ELASTICSEARCH_MAX_RESULTS || '10000', 10),
  };
}
