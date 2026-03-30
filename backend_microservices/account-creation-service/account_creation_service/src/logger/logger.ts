import pino from 'pino';
import config from '../config/config';
import { getTraceId } from '../context/request-context';

const logger = pino({
  level: config.server.logLevel,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: config.server.env,
    service: 'account-creation-service',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    return {
      traceId: getTraceId(),
    };
  },
});

export default logger;
