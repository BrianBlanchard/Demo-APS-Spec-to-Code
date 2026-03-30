import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  env: string;
  port: number;
  logLevel: string;
  database: DatabaseConfig;
  externalServices: ExternalServicesConfig;
  service: ServiceConfig;
  security: SecurityConfig;
  fraudDetection: FraudDetectionConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  poolMin: number;
  poolMax: number;
}

export interface ExternalServicesConfig {
  creditBureau: {
    url: string;
    apiKey: string;
  };
  governmentId: {
    url: string;
    apiKey: string;
  };
  fraudDetection: {
    url: string;
    apiKey: string;
  };
  addressVerification: {
    url: string;
    apiKey: string;
  };
}

export interface ServiceConfig {
  maxRetryAttempts: number;
  retryDelayMs: number;
  requestTimeoutMs: number;
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtIssuer: string;
}

export interface FraudDetectionConfig {
  riskHighThreshold: number;
  ficoScoreMinThreshold: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

const getEnvVarAsNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config: AppConfig = {
  env: getEnvVar('NODE_ENV', 'development'),
  port: getEnvVarAsNumber('PORT', 3000),
  logLevel: getEnvVar('LOG_LEVEL', 'info'),
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvVarAsNumber('DB_PORT', 5432),
    name: getEnvVar('DB_NAME', 'customer_verification'),
    user: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'postgres'),
    poolMin: getEnvVarAsNumber('DB_POOL_MIN', 2),
    poolMax: getEnvVarAsNumber('DB_POOL_MAX', 10),
  },
  externalServices: {
    creditBureau: {
      url: getEnvVar('CREDIT_BUREAU_API_URL', 'https://api.creditbureau.example.com'),
      apiKey: getEnvVar('CREDIT_BUREAU_API_KEY', 'dummy_key'),
    },
    governmentId: {
      url: getEnvVar('GOVERNMENT_ID_API_URL', 'https://api.govid.example.com'),
      apiKey: getEnvVar('GOVERNMENT_ID_API_KEY', 'dummy_key'),
    },
    fraudDetection: {
      url: getEnvVar('FRAUD_DETECTION_API_URL', 'https://api.fraud.example.com'),
      apiKey: getEnvVar('FRAUD_DETECTION_API_KEY', 'dummy_key'),
    },
    addressVerification: {
      url: getEnvVar('ADDRESS_VERIFICATION_API_URL', 'https://api.addressverify.example.com'),
      apiKey: getEnvVar('ADDRESS_VERIFICATION_API_KEY', 'dummy_key'),
    },
  },
  service: {
    maxRetryAttempts: getEnvVarAsNumber('MAX_RETRY_ATTEMPTS', 3),
    retryDelayMs: getEnvVarAsNumber('RETRY_DELAY_MS', 1000),
    requestTimeoutMs: getEnvVarAsNumber('REQUEST_TIMEOUT_MS', 5000),
    rateLimitMaxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 1000),
    rateLimitWindowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 60000),
  },
  security: {
    jwtSecret: getEnvVar('JWT_SECRET', 'default_secret_change_in_production'),
    jwtIssuer: getEnvVar('JWT_ISSUER', 'customer-verification-service'),
  },
  fraudDetection: {
    riskHighThreshold: getEnvVarAsNumber('FRAUD_RISK_HIGH_THRESHOLD', 70),
    ficoScoreMinThreshold: getEnvVarAsNumber('FICO_SCORE_MIN_THRESHOLD', 550),
  },
};
