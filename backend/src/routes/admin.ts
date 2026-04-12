import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getRelations, getStore, listAuditLogs, listUsers, saveReference } from '../db.js';

const router = express.Router();

router.get('/summary', authenticate, authorize('SUPER_ADMIN', 'DNA'), (_req, res) => {
  const relations = getRelations();
  const store = getStore();
  res.json({
    success: true,
    data: {
      employeurs: relations.employeurs.length,
      pays: relations.pays.length,
      aeroports: relations.aeroports.length,
      nationalites: relations.nationalites.length,
      totalUsers: store.users.length,
      totalAgents: store.agents.length,
      totalDocuments: store.documents.length,
    },
  });
});

router.get('/audit-logs', authenticate, authorize('SUPER_ADMIN', 'DNA', 'DLAA'), (_req, res) => {
  res.json({ success: true, data: listAuditLogs() });
});

router.get('/users', authenticate, authorize('SUPER_ADMIN', 'DNA'), (_req, res) => {
  res.json({ success: true, data: listUsers() });
});

router.post('/references/:kind', authenticate, authorize('SUPER_ADMIN', 'DNA'), (req, res) => {
  const kind = req.params.kind as any;
  const item = req.body;
  const saved = saveReference(kind, item);
  res.json({ success: true, data: saved });
});

export default router;
