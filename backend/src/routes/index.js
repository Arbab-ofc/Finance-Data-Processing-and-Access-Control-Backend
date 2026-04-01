import { Router } from 'express';

import { authRouter } from './authRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Finance API v1 is running' });
});

router.use('/auth', authRouter);

export const apiRouter = router;
