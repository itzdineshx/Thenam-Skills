import { Router } from 'express';
import { getActivities, createActivity, deleteActivity, toggleLikeActivity, commentActivity } from '../controllers/activityController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getActivities);
router.post('/', authMiddleware, createActivity);
router.delete('/:id', authMiddleware, deleteActivity);
router.post('/:id/like', authMiddleware, toggleLikeActivity);
router.post('/:id/comment', authMiddleware, commentActivity);

export default router;
