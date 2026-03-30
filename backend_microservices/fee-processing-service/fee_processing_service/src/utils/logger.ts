import pino from 'pino';
import { config } from '../config/app.config';

export const logger = pino({
  level: config.logging.level,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: config.serviceName,
  },
});
