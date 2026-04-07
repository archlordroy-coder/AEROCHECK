import express from 'express';
import { getRelations } from '../db.js';

const router = express.Router();

router.get('/nationalites', (_req, res) => {
  res.json({ success: true, data: getRelations().nationalites });
});

router.get('/employeurs', (_req, res) => {
  res.json({ success: true, data: getRelations().employeurs });
});

router.get('/pays', (_req, res) => {
  res.json({ success: true, data: getRelations().pays });
});

router.get('/aeroports', (req, res) => {
  const { paysId } = req.query as { paysId?: string };
  const items = paysId ? getRelations().aeroports.filter((item) => item.paysId === paysId) : getRelations().aeroports;
  res.json({ success: true, data: items });
});

export default router;
