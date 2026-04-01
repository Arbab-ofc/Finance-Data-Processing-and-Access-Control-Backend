import { Router } from 'express';

import { login, me, logout } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginValidation } from '../validations/authValidation.js';
import { loginRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post('/login', loginRateLimiter, loginValidation, validateRequest, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export const authRouter = router;
