import pino from 'pino';
import { config } from './config';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  traceId: string;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const logger = pino({
  level: config.logging.level,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  mixin() {
    const context = requestContext.getStore();
    return context ? { traceId: context.traceId, userId: context.userId } : {};
  },
  transport:
    config.env === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
