import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const createAgentSchema = z.object({
  dateNaissance: z.string(),
  lieuNaissance: z.string().min(2),
  nationalite: z.string().min(2),
  adresse: z.string().min(5),
  fonction: z.string().min(2),
  employeur: z.string().min(2),
  aeroport: z.string().min(2),
  zoneAcces: z.array(z.string()).default([])
});

const updateAgentSchema = createAgentSchema.partial();

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
  // QIP: agents from their country
  else if (user.role === 'QIP') {
    const countryAirportPrefix = user.pays === 'SENEGAL' ? 'DAKAR' : 'ABIDJAN';
    where.aeroport = { startsWith: countryAirportPrefix };
  }
  
  // DLAA: agents from their airport
  else if (user.role === 'DLAA') {
    where.aeroport = user.aeroport;
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
      aeroport: agent.aeroport,
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

// Create agent profile
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createAgentSchema.parse(req.body);

    // Check if user already has an agent profile
    const existing = await prisma.agent.findUnique({
      where: { userId: req.user!.id }
    });

    if (existing) {
      throw new AppError('Vous avez deja un profil agent', 400);
    }

    const agent = await prisma.agent.create({
      data: {
        userId: req.user!.id,
        matricule: generateMatricule(),
        dateNaissance: new Date(data.dateNaissance),
        lieuNaissance: data.lieuNaissance,
        nationalite: data.nationalite,
        adresse: data.adresse,
        fonction: data.fonction,
        employeur: data.employeur,
        aeroport: data.aeroport,
        zoneAcces: JSON.stringify(data.zoneAcces),
        status: 'EN_ATTENTE'
      },
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

    res.status(201).json({ success: true, data: agent });
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

    const updated = await prisma.agent.update({
      where: { id: req.params.id },
      data: {
        ...data,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
        zoneAcces: data.zoneAcces ? JSON.stringify(data.zoneAcces) : undefined
      },
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
