import { Router } from 'express';

import {
  categoryBreakdownController,
  recentActivityController,
  summaryController,
  trendsController,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { recentActivityValidation } from '../validations/dashboardValidation.js';

const router = Router();

router.use(authenticate);

router.get('/summary', summaryController);
router.get('/category-breakdown', categoryBreakdownController);
router.get('/trends', trendsController);
router.get('/recent-activity', recentActivityValidation, validateRequest, recentActivityController);

export const dashboardRouter = router;
