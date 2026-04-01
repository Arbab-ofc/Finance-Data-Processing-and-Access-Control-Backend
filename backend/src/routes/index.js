import { Router } from 'express';

import { authRouter } from './authRoutes.js';
import { userRouter } from './userRoutes.js';
import { recordRouter } from './recordRoutes.js';
import { dashboardRouter } from './dashboardRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Finance API v1 is running' });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/records', recordRouter);
router.use('/dashboard', dashboardRouter);

export const apiRouter = router;
