import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '../types/context.types';

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();
