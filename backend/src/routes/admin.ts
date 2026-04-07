import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getRelations } from '../db.js';

const router = express.Router();

router.get('/summary', authenticate, authorize('SUPER_ADMIN', 'DNA'), (_req, res) => {
  const relations = getRelations();
  res.json({
    success: true,
    data: {
      employeurs: relations.employeurs.length,
      pays: relations.pays.length,
      aeroports: relations.aeroports.length,
      nationalites: relations.nationalites.length,
    },
  });
});

export default router;
