export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  encryptionKey: string;
  jwtSecret: string;
  creditBureauApiUrl: string;
  creditBureauApiKey: string;
  creditBureauTimeout: number;
}

export const getAppConfig = (): AppConfig => {
  return {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key',
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
    creditBureauApiUrl: process.env.CREDIT_BUREAU_API_URL || 'https://api.creditbureau.com',
    creditBureauApiKey: process.env.CREDIT_BUREAU_API_KEY || '',
    creditBureauTimeout: Number(process.env.CREDIT_BUREAU_TIMEOUT) || 5000,
  };
};
