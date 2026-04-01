import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/references/nationalites - Liste toutes les nationalités
router.get('/nationalites', async (req, res, next) => {
  try {
    const nationalites = await prisma.nationalite.findMany({
      orderBy: { nom: 'asc' }
    });
    res.json({ success: true, data: nationalites });
  } catch (error) {
    next(error);
  }
});

// GET /api/references/employeurs - Liste tous les employeurs
router.get('/employeurs', async (req, res, next) => {
  try {
    const employeurs = await prisma.employeur.findMany({
      orderBy: { nom: 'asc' }
    });
    res.json({ success: true, data: employeurs });
  } catch (error) {
    next(error);
  }
});

// GET /api/references/pays - Liste tous les pays africains
router.get('/pays', async (req, res, next) => {
  try {
    const pays = await prisma.pays.findMany({
      orderBy: { nomFr: 'asc' }
    });
    res.json({ success: true, data: pays });
  } catch (error) {
    next(error);
  }
});

// GET /api/references/aeroports - Liste tous les aéroports ou filtre par pays
router.get('/aeroports', async (req, res, next) => {
  try {
    const { paysId } = req.query;
    
    const where = paysId ? { paysId: paysId as string } : {};
    
    const aeroports = await prisma.aeroport.findMany({
      where,
      include: { pays: true },
      orderBy: { nom: 'asc' }
    });
    
    res.json({ success: true, data: aeroports });
  } catch (error) {
    next(error);
  }
});

// GET /api/references/aeroports/:paysId - Liste les aéroports d'un pays spécifique
router.get('/aeroports/:paysId', async (req, res, next) => {
  try {
    const { paysId } = req.params;
    
    const aeroports = await prisma.aeroport.findMany({
      where: { paysId },
      orderBy: { nom: 'asc' }
    });
    
    res.json({ success: true, data: aeroports });
  } catch (error) {
    next(error);
  }
});

export default router;
