import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notifications.js';

const router = Router();

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ success: true, data: notifications });
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  const count = await prisma.notification.count({
    where: { userId: req.user!.id, read: false },
  });

  res.json({ success: true, data: { count } });
});

// Mark as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  const notification = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { read: true },
  });

  res.json({ success: true, data: notification });
});

// Mark all as read
router.post('/mark-all-read', authenticate, async (req: AuthRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true },
  });

  res.json({ success: true, message: 'Toutes les notifications marquées comme lues' });
});

export default router;
