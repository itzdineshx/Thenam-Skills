import { Router } from 'express';
import { syncUser, getCurrentUser, logoutUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/sync', authMiddleware, syncUser);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', logoutUser);

export default router;
