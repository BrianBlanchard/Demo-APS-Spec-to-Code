import { Router } from 'express';
import { CustomerSearchController } from '../controllers/customer-search.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { rateLimiterMiddleware } from '../middleware/rate-limiter.middleware';

export function createCustomerRoutes(): Router {
  const router = Router();
  const controller = new CustomerSearchController();

  router.get(
    '/search',
    authMiddleware,
    requireRole('associate', 'manager', 'admin'),
    rateLimiterMiddleware,
    controller.searchCustomers
  );

  return router;
}
