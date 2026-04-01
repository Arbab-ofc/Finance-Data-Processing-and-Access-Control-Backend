import { Router } from 'express';

import { authRouter } from './authRoutes.js';
import { userRouter } from './userRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Finance API v1 is running' });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);

export const apiRouter = router;
