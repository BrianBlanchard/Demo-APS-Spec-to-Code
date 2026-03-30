import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export interface RequestContext {
  traceId: string;
  userId?: string;
  ipAddress?: string;
  timestamp: Date;
}

export class AsyncContext {
  private static storage = new AsyncLocalStorage<RequestContext>();

  static run<T>(callback: () => T): T {
    const context: RequestContext = {
      traceId: randomUUID(),
      timestamp: new Date(),
    };
    return this.storage.run(context, callback);
  }

  static runWithContext<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  static getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  static getTraceId(): string {
    const context = this.getContext();
    return context?.traceId || 'no-trace-id';
  }

  static setUserId(userId: string): void {
    const context = this.getContext();
    if (context) {
      context.userId = userId;
    }
  }

  static setIpAddress(ipAddress: string): void {
    const context = this.getContext();
    if (context) {
      context.ipAddress = ipAddress;
    }
  }
}
