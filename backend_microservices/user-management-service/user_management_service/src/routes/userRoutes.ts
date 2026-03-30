import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validateRequest } from '../middlewares/validation';
import { SuspendUserRequestSchema } from '../models/dtos';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  router.post(
    '/admin/users/:user_id/suspend',
    validateRequest(SuspendUserRequestSchema),
    userController.suspendUser
  );

  return router;
};
