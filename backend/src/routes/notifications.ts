import express from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { listNotifications, markNotificationRead } from '../db.js';

const router = express.Router();

router.get('/', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Non authentifié' });
    return;
  }
  const notifications = listNotifications(req.user.id);
  res.json({ success: true, data: notifications });
});

router.post('/:id/read', authenticate, (req: AuthRequest, res) => {
  markNotificationRead(req.params.id);
  res.json({ success: true });
});

export default router;
