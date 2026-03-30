import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<{ traceId: string }>();

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  mixin() {
    const store = asyncLocalStorage.getStore();
    return store ? { traceId: store.traceId } : {};
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const getTraceId = (): string | undefined => {
  return asyncLocalStorage.getStore()?.traceId;
};
