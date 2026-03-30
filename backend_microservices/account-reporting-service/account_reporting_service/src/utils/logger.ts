import pino from 'pino';
import { getAppConfig } from '../config/app.config';
import { getTraceId } from './async-context';

const config = getAppConfig();

export const logger = pino({
  level: config.logLevel,
  transport:
    config.nodeEnv === 'development'
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
    log(object) {
      return {
        ...object,
        traceId: getTraceId(),
      };
    },
  },
});

export function createLogger(module: string): pino.Logger {
  return logger.child({ module });
}
