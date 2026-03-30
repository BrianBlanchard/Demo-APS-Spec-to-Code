import pino from 'pino';
import { getRequestContext } from '../middleware/trace-context.middleware';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  mixin() {
    const context = getRequestContext();
    return context
      ? {
          traceId: context.traceId,
          userId: context.userId,
          userRole: context.userRole,
        }
      : {};
  },
});

export { logger };
