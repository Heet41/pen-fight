import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/history', authenticate, UserController.getMatchHistory);
router.get('/achievements', authenticate, UserController.getAchievements);
router.get('/inventory', authenticate, UserController.getInventory);
router.post('/equip', authenticate, UserController.equip);
router.post('/record-match', authenticate, UserController.recordMatch);
router.get('/friends', authenticate, UserController.getFriends);
router.post('/friends/request', authenticate, UserController.sendFriendRequest);
router.post('/friends/accept', authenticate, UserController.acceptFriendRequest);
router.get('/:id', UserController.getProfile);

export default router;
