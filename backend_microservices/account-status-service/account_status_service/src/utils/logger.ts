import pino from 'pino';
import { getContext } from './context';

const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.LOG_PRETTY === 'true' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
};

const baseLogger = pino(loggerConfig);

export interface LogContext {
  traceId?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private maskSensitiveData(data: unknown): unknown {
    if (typeof data === 'string') {
      // Mask account IDs (11 digits)
      return data.replace(/\b\d{11}\b/g, '***********');
    }
    if (typeof data === 'object' && data !== null) {
      const masked: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (['accountId', 'cardNumber', 'balance'].includes(key)) {
          masked[key] = '***MASKED***';
        } else {
          masked[key] = this.maskSensitiveData(value);
        }
      }
      return masked;
    }
    return data;
  }

  private enrichWithContext(message: string, context?: LogContext): { msg: string; context: LogContext } {
    const requestContext = getContext();
    const enrichedContext: LogContext = {
      ...(context || {}),
      ...(requestContext && {
        traceId: requestContext.traceId,
        userId: requestContext.userId,
      }),
    };
    return { msg: message, context: enrichedContext };
  }

  info(message: string, context?: LogContext): void {
    const { msg, context: ctx } = this.enrichWithContext(message, context);
    baseLogger.info(this.maskSensitiveData(ctx), msg);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const { msg, context: ctx } = this.enrichWithContext(message, context);
    const masked = this.maskSensitiveData(ctx) as Record<string, unknown>;
    baseLogger.error(
      {
        ...masked,
        error: error ? { message: error.message, stack: error.stack } : undefined,
      },
      msg
    );
  }

  warn(message: string, context?: LogContext): void {
    const { msg, context: ctx } = this.enrichWithContext(message, context);
    baseLogger.warn(this.maskSensitiveData(ctx), msg);
  }

  debug(message: string, context?: LogContext): void {
    const { msg, context: ctx } = this.enrichWithContext(message, context);
    baseLogger.debug(this.maskSensitiveData(ctx), msg);
  }
}

export const logger = new Logger();
