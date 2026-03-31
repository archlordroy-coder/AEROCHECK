import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// List archived documents (with optional filters)
router.get('/archived', authenticate, async (req: AuthRequest, res: Response) => {
  const { agentId, type, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { archived: true };

  if (agentId) where.agentId = agentId;
  if (type) where.type = type;

  // Agents can only see their own archived documents
  if (req.user!.role === 'AGENT') {
    const agent = await prisma.agent.findUnique({
      where: { userId: req.user!.id }
    });
    if (agent) {
      where.agentId = agent.id;
    }
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
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
      orderBy: { archivedAt: 'desc' }
    }),
    prisma.document.count({ where })
  ]);

  res.json({
    success: true,
    data: documents,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

// Archive a document
router.post(
  '/:id/archive',
  authenticate,
  authorize('AGENT', 'QIP', 'DLAA', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id: req.params.id as string },
        include: { agent: true }
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      // Only owner or admin can archive
      if (req.user!.role === 'AGENT' && document.agent.userId !== req.user!.id) {
        throw new AppError('Accès refusé', 403);
      }

      // Can only archive validated or rejected documents
      if (document.status === 'EN_ATTENTE') {
        throw new AppError('Impossible d\'archiver un document en attente', 400);
      }

      const archived = await prisma.document.update({
        where: { id: req.params.id as string },
        data: {
          archived: true,
          archivedAt: new Date()
        },
        include: {
          agent: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      });

      res.json({ success: true, data: archived });
    } catch (error) {
      next(error);
    }
  }
);

// Restore an archived document
router.post(
  '/:id/restore',
  authenticate,
  authorize('AGENT', 'QIP', 'DLAA', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id: req.params.id as string },
        include: { agent: true }
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      // Only owner or admin can restore
      if (req.user!.role === 'AGENT' && document.agent.userId !== req.user!.id) {
        throw new AppError('Accès refusé', 403);
      }

      const restored = await prisma.document.update({
        where: { id: req.params.id as string },
        data: {
          archived: false,
          archivedAt: null
        },
        include: {
          agent: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      });

      res.json({ success: true, data: restored });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
