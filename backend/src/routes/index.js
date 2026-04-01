import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Finance API v1 is running' });
});

export const apiRouter = router;
