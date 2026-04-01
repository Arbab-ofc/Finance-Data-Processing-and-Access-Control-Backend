import { Router } from 'express';

import {
  createRecordController,
  deleteRecordController,
  getRecordController,
  listRecordsController,
  updateRecordController,
} from '../controllers/recordController.js';
import { USER_ROLES } from '../constants/roles.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorizeMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { mongoIdParam } from '../validations/commonValidation.js';
import { createRecordValidation, listRecordValidation, updateRecordValidation } from '../validations/recordValidation.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(USER_ROLES.ADMIN), createRecordValidation, validateRequest, createRecordController);
router.get('/', listRecordValidation, validateRequest, listRecordsController);
router.get('/:id', mongoIdParam(), validateRequest, getRecordController);
router.patch('/:id', authorize(USER_ROLES.ADMIN), [...mongoIdParam(), ...updateRecordValidation], validateRequest, updateRecordController);
router.delete('/:id', authorize(USER_ROLES.ADMIN), mongoIdParam(), validateRequest, deleteRecordController);

export const recordRouter = router;
