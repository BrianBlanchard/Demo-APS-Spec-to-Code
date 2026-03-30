import pino from 'pino';
import { getTraceId } from './async-context';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  mixin() {
    return {
      traceId: getTraceId(),
    };
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
