import pino from 'pino';
import { config } from '../config/config';
import { getRequestContext } from '../middleware/requestContext';

const pinoLogger = pino({
  level: config.logLevel,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    const context = getRequestContext();
    return context
      ? {
          traceId: context.traceId,
          requestId: context.requestId,
        }
      : {};
  },
});

export const logger = pinoLogger;
