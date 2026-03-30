import pino from 'pino';
import { config } from '../config/config';
import { getTraceId } from '../middleware/tracing.middleware';

const baseLogger = pino({
  level: config.app.nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    config.app.nodeEnv === 'development'
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
});

// Logger that automatically includes traceId
export const logger = {
  info: (obj: object | string, msg?: string) => {
    const traceId = getTraceId();
    if (typeof obj === 'string') {
      baseLogger.info({ traceId }, obj);
    } else {
      baseLogger.info({ ...obj, traceId }, msg);
    }
  },
  error: (obj: object | string, msg?: string) => {
    const traceId = getTraceId();
    if (typeof obj === 'string') {
      baseLogger.error({ traceId }, obj);
    } else {
      baseLogger.error({ ...obj, traceId }, msg);
    }
  },
  warn: (obj: object | string, msg?: string) => {
    const traceId = getTraceId();
    if (typeof obj === 'string') {
      baseLogger.warn({ traceId }, obj);
    } else {
      baseLogger.warn({ ...obj, traceId }, msg);
    }
  },
  debug: (obj: object | string, msg?: string) => {
    const traceId = getTraceId();
    if (typeof obj === 'string') {
      baseLogger.debug({ traceId }, obj);
    } else {
      baseLogger.debug({ ...obj, traceId }, msg);
    }
  },
};
