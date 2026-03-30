import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export interface TracingContext {
  traceId: string;
  userId?: string;
  ipAddress?: string;
}

export const tracingStorage = new AsyncLocalStorage<TracingContext>();

export function generateTraceId(): string {
  return randomUUID();
}

export function getTraceId(): string | undefined {
  return tracingStorage.getStore()?.traceId;
}

export function getUserId(): string | undefined {
  return tracingStorage.getStore()?.userId;
}

export function getIpAddress(): string | undefined {
  return tracingStorage.getStore()?.ipAddress;
}

export function runWithTracing<T>(context: TracingContext, fn: () => T): T {
  return tracingStorage.run(context, fn);
}
