import { Router } from 'express';
import { createCustomerRoutes } from './customer.routes';
import { createHealthRoutes } from './health.routes';

export function createRoutes(): Router {
  const router = Router();

  // Health routes (no /api prefix)
  router.use('/health', createHealthRoutes());

  // API routes
  router.use('/api/v1/customers', createCustomerRoutes());

  // Additional health endpoint with versioned path
  router.use('/v1/customer-search-service/health', createHealthRoutes());

  return router;
}
