import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const createAgentSchema = z.object({
  matricule: z.string().min(3),
  dateNaissance: z.string(),
  lieuNaissance: z.string().min(2),
  nationaliteId: z.string(),
  adresse: z.string().min(5),
  fonction: z.string().min(2),
  employeurId: z.string(),
  paysId: z.string(),
  aeroportId: z.string(),
  zoneAcces: z.array(z.string()).default([])
});

const updateAgentSchema = z.object({
  matricule: z.string().min(3).optional(),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().min(2).optional(),
  nationaliteId: z.string().optional(),
  adresse: z.string().min(5).optional(),
  fonction: z.string().min(2).optional(),
  employeurId: z.string().optional(),
  paysId: z.string().optional(),
  aeroportId: z.string().optional(),
  zoneAcces: z.array(z.string()).default([]).optional(),
  sexe: z.enum(['M', 'F']).optional(),
  qualifications: z.array(z.string()).optional(),
  whatsapp: z.string().optional(),
  photoUrl: z.string().optional()
});

// Generate unique matricule
function generateMatricule(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `AG${year}${random}`;
}

// List agents
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { status, search, page = '1', limit = '10' } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { matricule: { contains: search as string } },
      { user: { firstName: { contains: search as string } } },
      { user: { lastName: { contains: search as string } } }
    ];
  }

  // If user is an agent, only show their own profile
  if (req.user!.role === 'AGENT') {
    where.userId = req.user!.id;
  }

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true
          }
        },
        documents: true,
        licenses: true
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.agent.count({ where })
  ]);

  res.json({
    success: true,
    data: agents,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// Get agents with document stats by country (for QIP) or airport (for DLAA)
router.get('/with-doc-stats', authenticate, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  
  let where: any = {};
  
  // SUPER_ADMIN: see all agents (no filter)
  if (user.role === 'SUPER_ADMIN') {
    // No filter applied - sees all agents
  }
  // QIP: agents from their country (RELAXED FOR TEST: see all)
  else if (user.role === 'QIP') {
    // const countryAirportPrefix = user.pays === 'SENEGAL' ? 'DAKAR' : 'ABIDJAN';
    // where.aeroport = { startsWith: countryAirportPrefix };
    // Relaxed for test
  }
  
  // DLAA: agents from their airport (RELAXED FOR TEST: see all)
  else if (user.role === 'DLAA') {
    // where.aeroport = user.aeroport;
    // Relaxed for test
  }
  
  // AGENT: only themselves
  else if (user.role === 'AGENT') {
    where.userId = user.id;
  }

  const agents = await prisma.agent.findMany({
    where,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      },
      aeroport: {
        select: { nom: true, code: true }
      },
      documents: {
        select: { id: true, status: true, type: true }
      },
      _count: {
        select: { documents: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate stats for each agent
  const agentsWithStats = agents.map(agent => {
    const totalDocs = agent.documents.length;
    const validatedDocs = agent.documents.filter(d => d.status === 'VALIDE').length;
    const pendingDocs = agent.documents.filter(d => d.status === 'EN_ATTENTE').length;
    const rejectedDocs = agent.documents.filter(d => d.status === 'REJETE').length;
    
    return {
      id: agent.id,
      matricule: agent.matricule,
      firstName: agent.user.firstName,
      lastName: agent.user.lastName,
      email: agent.user.email,
      aeroport: agent.aeroport?.nom ?? agent.aeroport?.code ?? '',
      status: agent.status,
      documentStats: {
        total: totalDocs,
        validated: validatedDocs,
        pending: pendingDocs,
        rejected: rejectedDocs
      }
    };
  });

  res.json({
    success: true,
    data: agentsWithStats,
    total: agentsWithStats.length
  });
});

// Get single agent
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true
          }
        },
        documents: {
          include: {
            validations: {
              include: {
                validator: {
                  select: { firstName: true, lastName: true, role: true }
                }
              }
            }
          }
        },
        licenses: true
      }
    });

    if (!agent) {
      throw new AppError('Agent non trouve', 404);
    }

    // Check access
    if (req.user!.role === 'AGENT' && agent.userId !== req.user!.id) {
      throw new AppError('Acces refuse', 403);
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
});

// Create agent
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createAgentSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if user already has an agent profile
    const existingAgent = await prisma.agent.findUnique({
      where: { userId }
    });

    if (existingAgent) {
      throw new AppError('Profil agent deja existant', 400);
    }

    // Check if matricule is unique
    const existingMatricule = await prisma.agent.findUnique({
      where: { matricule: data.matricule }
    });

    if (existingMatricule) {
      throw new AppError('Ce matricule est deja utilise', 400);
    }

    // Verify that referenced entities exist
    const [nationalite, employeur, pays, aeroport] = await Promise.all([
      prisma.nationalite.findUnique({ where: { id: data.nationaliteId } }),
      prisma.employeur.findUnique({ where: { id: data.employeurId } }),
      prisma.pays.findUnique({ where: { id: data.paysId } }),
      prisma.aeroport.findUnique({ where: { id: data.aeroportId } })
    ]);

    if (!nationalite) throw new AppError('Nationalite invalide', 400);
    if (!employeur) throw new AppError('Employeur invalide', 400);
    if (!pays) throw new AppError('Pays invalide', 400);
    if (!aeroport) throw new AppError('Aeroport invalide', 400);

    // Verify that airport belongs to selected country
    if (aeroport.paysId !== pays.id) {
      throw new AppError('L\'aeroport selectionne n\'appartient pas au pays choisi', 400);
    }

    const agent = await prisma.agent.create({
      data: {
        userId,
        matricule: data.matricule,
        dateNaissance: new Date(data.dateNaissance),
        lieuNaissance: data.lieuNaissance,
        nationaliteId: data.nationaliteId,
        adresse: data.adresse,
        fonction: data.fonction,
        employeurId: data.employeurId,
        paysId: data.paysId,
        aeroportId: data.aeroportId,
        zoneAcces: JSON.stringify(data.zoneAcces || []),
        status: 'EN_ATTENTE'
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        nationalite: true,
        employeur: true,
        pays: true,
        aeroport: { include: { pays: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: agent,
      message: 'Profil agent cree avec succes'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
      return;
    }
    next(error);
  }
});

// Update agent
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id }
    });

    if (!agent) {
      throw new AppError('Agent non trouve', 404);
    }

    // Only owner or admin can update
    if (req.user!.role === 'AGENT' && agent.userId !== req.user!.id) {
      throw new AppError('Acces refuse', 403);
    }

    const data = updateAgentSchema.parse(req.body);

    // Build update data with proper type handling
    const updateData: any = {};
    if (data.matricule) updateData.matricule = data.matricule;
    if (data.dateNaissance) updateData.dateNaissance = new Date(data.dateNaissance);
    if (data.lieuNaissance) updateData.lieuNaissance = data.lieuNaissance;
    if (data.nationaliteId) updateData.nationaliteId = data.nationaliteId;
    if (data.adresse) updateData.adresse = data.adresse;
    if (data.fonction) updateData.fonction = data.fonction;
    if (data.employeurId) updateData.employeurId = data.employeurId;
    if (data.paysId) updateData.paysId = data.paysId;
    if (data.aeroportId) updateData.aeroportId = data.aeroportId;
    if (data.zoneAcces) updateData.zoneAcces = JSON.stringify(data.zoneAcces);
    if (data.sexe) updateData.sexe = data.sexe;
    if (data.qualifications) updateData.qualifications = JSON.stringify(data.qualifications);
    if (data.whatsapp) updateData.whatsapp = data.whatsapp;
    if (data.photoUrl) updateData.photoUrl = data.photoUrl;

    const updated = await prisma.agent.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        success: false, 
        error: error.errors[0].message 
      });
      return;
    }
    next(error);
  }
});

// Update agent status (QIP/DLAA/ADMIN only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('QIP', 'DLAA', 'DNA', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { status } = req.body;

      if (!status) {
        throw new AppError('Statut requis', 400);
      }

      const agent = await prisma.agent.update({
        where: { id: req.params.id },
        data: { status }
      });

      res.json({ success: true, data: agent });
    } catch (error) {
      next(error);
    }
  }
);

// Get agent licenses
router.get('/:id/licenses', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id }
    });

    if (!agent) {
      throw new AppError('Agent non trouve', 404);
    }

    // Only owner or authorized roles can view licenses
    if (req.user!.role === 'AGENT' && agent.userId !== req.user!.id) {
      throw new AppError('Acces refuse', 403);
    }

    const licenses = await prisma.license.findMany({
      where: { agentId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: licenses });
  } catch (error) {
    next(error);
  }
});

// Delete agent (ADMIN only)
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      await prisma.agent.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true, message: 'Agent supprime' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
