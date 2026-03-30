import pino from 'pino';
import { RequestContext } from '../types/context.types';
import { getRequestContext } from './async-context.config';

const level = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  mixin(): Partial<RequestContext> {
    const context = getRequestContext();
    return context ? { traceId: context.traceId } : {};
  },
});

export const createLogger = (module: string): pino.Logger => {
  return logger.child({ module });
};
