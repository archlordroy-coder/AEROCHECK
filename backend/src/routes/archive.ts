import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (_req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
