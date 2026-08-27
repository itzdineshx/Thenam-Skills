import { Router } from 'express';
import { getUsers, getUserById, updateUserRole, deleteUser, getStatistics } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.get('/users', authMiddleware, requireRole('admin', 'faculty'), getUsers);
router.get('/users/:id', authMiddleware, requireRole('admin', 'faculty'), getUserById);
router.patch('/users/:id/role', authMiddleware, requireRole('admin'), updateUserRole);
router.delete('/users/:id', authMiddleware, requireRole('admin'), deleteUser);
router.get('/statistics', authMiddleware, requireRole('admin', 'faculty'), getStatistics);

export default router;
