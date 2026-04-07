import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'notif-1',
        title: 'Document en attente',
        detail: 'Une piece est en attente de verification QIP.',
        createdAt: new Date().toISOString(),
      },
    ],
  });
});

export default router;
