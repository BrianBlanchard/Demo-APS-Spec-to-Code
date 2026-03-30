import pino from 'pino';
import { config } from '../config';
import { getContext } from '../middleware/context.middleware';

export const logger = pino({
  level: config.logging.level,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  mixin() {
    const context = getContext();
    return {
      traceId: context?.traceId,
      userId: context?.userId,
    };
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
