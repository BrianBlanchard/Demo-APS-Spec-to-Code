import pino from 'pino';
import { envConfig } from './env.config';

export const logger = pino({
  level: envConfig.logging.level,
  transport: envConfig.logging.pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    service: envConfig.serviceName,
    version: envConfig.serviceVersion,
  },
});
