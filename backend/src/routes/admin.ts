import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { prisma } from '../index.js';

const router = Router();

// Schema for document type config
const docTypeConfigSchema = z.object({
  type: z.string(),
  validityDuration: z.number().min(1, 'La durée doit être au moins 1 jour'),
  isRequired: z.boolean().default(true)
});

// Get all document type configurations
router.get('/doc-type-configs', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  const configs = await prisma.documentTypeConfig.findMany({
    orderBy: { type: 'asc' }
  });
  res.json({ success: true, data: configs });
});

// Create or update document type configuration
router.post('/doc-type-configs', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = docTypeConfigSchema.parse(req.body);
    
    const config = await prisma.documentTypeConfig.upsert({
      where: { type: data.type },
      update: {
        validityDuration: data.validityDuration,
        isRequired: data.isRequired
      },
      create: {
        type: data.type,
        validityDuration: data.validityDuration,
        isRequired: data.isRequired
      }
    });
    
    res.json({ success: true, data: config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    next(error);
  }
});

// Delete document type configuration
router.delete('/doc-type-configs/:id', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.documentTypeConfig.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Configuration supprimée' });
  } catch (error) {
    next(error);
  }
});

// Initialize default document type configs
router.post('/init-doc-types', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  const defaultTypes = [
    { type: 'CARTE_IDENTITE', validityDuration: 365, isRequired: true },
    { type: 'PERMIS_CONDUITE', validityDuration: 365, isRequired: true },
    { type: 'CERTIFICAT_MEDICAL', validityDuration: 90, isRequired: true },
    { type: 'CERTIFICAT_FORMATION', validityDuration: 365, isRequired: true },
    { type: 'CONTRAT_TRAVAIL', validityDuration: 365, isRequired: true },
    { type: 'ATTESTATION_EMPLOI', validityDuration: 180, isRequired: true }
  ];
  
  const created = [];
  for (const type of defaultTypes) {
    const config = await prisma.documentTypeConfig.upsert({
      where: { type: type.type },
      update: type,
      create: type
    });
    created.push(config);
  }
  
  res.json({ success: true, data: created, message: 'Types de documents initialisés' });
});

export default router;
