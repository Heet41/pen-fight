import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/public', RoomController.getPublic);
router.get('/:code', RoomController.getByCode);
router.post('/', authenticate, RoomController.create);
router.post('/join', authenticate, RoomController.join);
router.post('/:id/leave', authenticate, RoomController.leave);

export default router;
