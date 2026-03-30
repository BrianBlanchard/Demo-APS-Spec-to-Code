import pino from 'pino';
import { config } from '../config';
import { asyncLocalStorage } from './async-context';

export const logger = pino({
  level: config.logLevel,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  mixin() {
    const context = asyncLocalStorage.getStore();
    return context ? { traceId: context.traceId } : {};
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
