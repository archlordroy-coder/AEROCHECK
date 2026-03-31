import { Router, Response } from 'express';
import { z } from 'zod';
import QRCode from 'qrcode';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const issueLicenseSchema = z.object({
  agentId: z.string(),
  validityYears: z.number().min(1).max(5).default(2)
});

// Generate license number
function generateLicenseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `DLAA-${year}-${random}`;
}

// List licenses
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { agentId, status, page = '1', limit = '10' } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  
  if (agentId) where.agentId = agentId;
  if (status) where.status = status;

  // Agents can only see their own licenses
  if (req.user!.role === 'AGENT') {
    const agent = await prisma.agent.findUnique({
      where: { userId: req.user!.id }
    });
    if (agent) {
      where.agentId = agent.id;
    } else {
      res.json({
        success: true,
        data: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0
      });
      return;
    }
  }

  const [licenses, total] = await Promise.all([
    prisma.license.findMany({
      where,
      include: {
        agent: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.license.count({ where })
  ]);

  res.json({
    success: true,
    data: licenses,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// Get single license
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const license = await prisma.license.findUnique({
      where: { id: req.params.id },
      include: {
        agent: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    if (!license) {
      throw new AppError('Licence non trouvee', 404);
    }

    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
});

// Issue license (DLAA only)
router.post(
  '/',
  authenticate,
  authorize('DLAA', 'ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const data = issueLicenseSchema.parse(req.body);

      const agent = await prisma.agent.findUnique({
        where: { id: data.agentId },
        include: { user: true }
      });

      if (!agent) {
        throw new AppError('Agent non trouve', 404);
      }

      // Check if agent is QIP validated
      if (agent.status !== 'QIP_VALIDE' && agent.status !== 'LICENCE_EXPIREE') {
        throw new AppError(
          'L\'agent doit etre valide QIP avant emission de licence', 
          400
        );
      }

      // Check for existing active license
      const existingLicense = await prisma.license.findFirst({
        where: {
          agentId: data.agentId,
          status: 'ACTIVE'
        }
      });

      if (existingLicense) {
        throw new AppError('L\'agent possede deja une licence active', 400);
      }

      const numero = generateLicenseNumber();
      const dateEmission = new Date();
      const dateExpiration = new Date();
      dateExpiration.setFullYear(dateExpiration.getFullYear() + data.validityYears);

      // Generate QR code
      const qrData = JSON.stringify({
        numero,
        agent: `${agent.user.firstName} ${agent.user.lastName}`,
        matricule: agent.matricule,
        dateEmission: dateEmission.toISOString(),
        dateExpiration: dateExpiration.toISOString()
      });

      const qrCode = await QRCode.toDataURL(qrData);

      const license = await prisma.license.create({
        data: {
          agentId: data.agentId,
          numero,
          dateEmission,
          dateExpiration,
          status: 'ACTIVE',
          qrCode
        },
        include: {
          agent: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          }
        }
      });

      // Update agent status
      await prisma.agent.update({
        where: { id: data.agentId },
        data: { status: 'LICENCE_ACTIVE' }
      });

      res.status(201).json({ success: true, data: license });
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
  }
);

// Update license status
router.patch(
  '/:id/status',
  authenticate,
  authorize('DLAA', 'SUPERVISEUR', 'ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { status } = req.body;

      if (!['ACTIVE', 'EXPIREE', 'SUSPENDUE', 'REVOQUEE'].includes(status)) {
        throw new AppError('Statut invalide', 400);
      }

      const license = await prisma.license.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          agent: true
        }
      });

      // Update agent status accordingly
      let agentStatus = 'LICENCE_ACTIVE';
      if (status === 'EXPIREE') agentStatus = 'LICENCE_EXPIREE';
      if (status === 'SUSPENDUE') agentStatus = 'LICENCE_SUSPENDUE';
      if (status === 'REVOQUEE') agentStatus = 'QIP_REJETE';

      await prisma.agent.update({
        where: { id: license.agentId },
        data: { status: agentStatus }
      });

      res.json({ success: true, data: license });
    } catch (error) {
      next(error);
    }
  }
);

// Generate/Regenerate QR code
router.post(
  '/:id/qrcode',
  authenticate,
  authorize('DLAA', 'ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const license = await prisma.license.findUnique({
        where: { id: req.params.id },
        include: {
          agent: {
            include: { user: true }
          }
        }
      });

      if (!license) {
        throw new AppError('Licence non trouvee', 404);
      }

      const qrData = JSON.stringify({
        numero: license.numero,
        agent: `${license.agent.user.firstName} ${license.agent.user.lastName}`,
        matricule: license.agent.matricule,
        dateEmission: license.dateEmission,
        dateExpiration: license.dateExpiration
      });

      const qrCode = await QRCode.toDataURL(qrData);

      const updated = await prisma.license.update({
        where: { id: req.params.id },
        data: { qrCode }
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
