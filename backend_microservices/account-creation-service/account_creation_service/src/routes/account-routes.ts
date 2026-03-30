import { Router } from 'express';
import { AccountController } from '../controllers/account-controller';
import { validateRequest } from '../middleware/validation-middleware';
import { CreateAccountRequestSchema } from '../types/dtos';

export function createAccountRoutes(accountController: AccountController): Router {
  const router = Router();

  router.post(
    '/',
    validateRequest(CreateAccountRequestSchema),
    accountController.createAccount.bind(accountController)
  );

  return router;
}
