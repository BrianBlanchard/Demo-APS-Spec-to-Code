import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware';
import { createCustomerSchema } from '../validators/customer.validator';

export const createCustomerRoutes = (customerController: CustomerController): Router => {
  const router = Router();

  router.post(
    '/customers',
    authMiddleware,
    authorizeRoles('ADMIN', 'CSR'),
    validateRequest(createCustomerSchema),
    customerController.createCustomer
  );

  return router;
};
