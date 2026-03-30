import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import {
  customerIdParamSchema,
  getCustomerQuerySchema,
  updateCustomerSchema,
} from '../validators/customerValidators';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

export function createCustomerRoutes(customerController: CustomerController): Router {
  const router = Router();

  const getLimiter = rateLimit({
    windowMs: config.rateLimit.get.windowMs,
    max: config.rateLimit.get.max,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const putLimiter = rateLimit({
    windowMs: config.rateLimit.put.windowMs,
    max: config.rateLimit.put.max,
    standardHeaders: true,
    legacyHeaders: false,
  });

  router.get(
    '/:customerId',
    authMiddleware,
    getLimiter,
    validateRequest({
      params: customerIdParamSchema,
      query: getCustomerQuerySchema,
    }),
    customerController.getCustomer
  );

  router.put(
    '/:customerId',
    authMiddleware,
    putLimiter,
    validateRequest({
      params: customerIdParamSchema,
      body: updateCustomerSchema,
    }),
    customerController.updateCustomer
  );

  return router;
}
