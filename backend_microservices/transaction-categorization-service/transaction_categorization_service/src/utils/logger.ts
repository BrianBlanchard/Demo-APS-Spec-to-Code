import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';
import type { RequestContext } from '../types/request-context.types';

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  mixin() {
    const context = requestContextStorage.getStore();
    return context ? { traceId: context.traceId } : {};
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
