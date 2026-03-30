import pino from 'pino';
import { config } from './index';
import { getTraceId, getUserId } from '../utils/tracing';

export const logger = pino({
  level: config.logging.level,
  ...(config.logging.prettyPrint && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    service: config.server.serviceName,
    env: config.server.env,
  },
  mixin() {
    return {
      traceId: getTraceId(),
      userId: getUserId(),
    };
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});
