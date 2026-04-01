import { Router } from 'express';

import {
  createUserController,
  getUserController,
  listUsersController,
  resetPasswordController,
  updateRoleController,
  updateStatusController,
  updateUserController,
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorizeMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireAtLeastOneField } from '../middlewares/requireFieldsMiddleware.js';
import { USER_ROLES } from '../constants/roles.js';
import { mongoIdParam } from '../validations/commonValidation.js';
import {
  createUserValidation,
  listUsersValidation,
  resetPasswordValidation,
  updateRoleValidation,
  updateStatusValidation,
  updateUserValidation,
} from '../validations/userValidation.js';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.post('/', createUserValidation, validateRequest, createUserController);
router.get('/', listUsersValidation, validateRequest, listUsersController);
router.get('/:id', mongoIdParam(), validateRequest, getUserController);
router.patch(
  '/:id',
  [...mongoIdParam(), ...updateUserValidation],
  validateRequest,
  requireAtLeastOneField(['name', 'email']),
  updateUserController,
);
router.patch('/:id/role', [...mongoIdParam(), ...updateRoleValidation], validateRequest, updateRoleController);
router.patch('/:id/status', [...mongoIdParam(), ...updateStatusValidation], validateRequest, updateStatusController);
router.patch('/:id/password-reset', [...mongoIdParam(), ...resetPasswordValidation], validateRequest, resetPasswordController);

export const userRouter = router;
