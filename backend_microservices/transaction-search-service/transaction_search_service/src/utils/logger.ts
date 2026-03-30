import pino from 'pino';
import { getTraceId } from './context.storage';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    return {
      traceId: getTraceId(),
    };
  },
});

export { logger };
