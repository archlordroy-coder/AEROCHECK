import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const createDocumentSchema = z.object({
  agentId: z.string(),
  type: z.enum([
    'PIECE_IDENTITE',
    'PHOTO_IDENTITE',
    'CASIER_JUDICIAIRE',
    'CERTIFICAT_MEDICAL',
    'ATTESTATION_FORMATION',
    'CONTRAT_TRAVAIL'
  ]),
  fileName: z.string()
});

const validateDocumentSchema = z.object({
  status: z.enum(['VALIDE', 'REJETE']),
  comment: z.string().optional()
});

// List documents
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { agentId, status, type, page = '1', limit = '10' } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  
  if (agentId) where.agentId = agentId;
  if (status) where.status = status;
  if (type) where.type = type;

  // QIP can only see documents pending validation
  if (req.user!.role === 'QIP') {
    where.status = 'EN_ATTENTE';
  }

  // Agents can only see their own documents
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
        },
        validations: {
          include: {
            validator: {
              select: { firstName: true, lastName: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
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

// Get single document
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        agent: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        validations: {
          include: {
            validator: {
              select: { firstName: true, lastName: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!document) {
      throw new AppError('Document non trouve', 404);
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
});

// Submit document (mock upload)
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createDocumentSchema.parse(req.body);

    // Verify agent exists and belongs to user (if agent role)
    const agent = await prisma.agent.findUnique({
      where: { id: data.agentId }
    });

    if (!agent) {
      throw new AppError('Agent non trouve', 404);
    }

    if (req.user!.role === 'AGENT' && agent.userId !== req.user!.id) {
      throw new AppError('Acces refuse', 403);
    }

    // Check if document type already submitted
    const existing = await prisma.document.findFirst({
      where: {
        agentId: data.agentId,
        type: data.type,
        status: { in: ['EN_ATTENTE', 'VALIDE'] }
      }
    });

    if (existing) {
      throw new AppError('Ce type de document a deja ete soumis', 400);
    }

    // Create document with mock file path
    const document = await prisma.document.create({
      data: {
        agentId: data.agentId,
        type: data.type,
        fileName: data.fileName,
        filePath: `/uploads/mock/${data.agentId}/${data.type}_${Date.now()}.pdf`,
        status: 'EN_ATTENTE'
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

    // Update agent status if needed
    const docCount = await prisma.document.count({
      where: { agentId: data.agentId }
    });

    if (docCount >= 1 && agent.status === 'EN_ATTENTE') {
      await prisma.agent.update({
        where: { id: data.agentId },
        data: { status: 'DOCUMENTS_SOUMIS' }
      });
    }

    res.status(201).json({ success: true, data: document });
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

// Validate/Reject document (QIP/DLAA workflow)
router.put(
  '/:id/validate',
  authenticate,
  authorize('QIP', 'DLAA', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const data = validateDocumentSchema.parse(req.body);
      const validatorRole = req.user!.role;

      const document = await prisma.document.findUnique({
        where: { id: req.params.id },
        include: { 
          agent: { include: { user: true } },
          validations: true 
        }
      });

      if (!document) {
        throw new AppError('Document non trouve', 404);
      }

      // Vérifier les permissions selon le niveau
      if (validatorRole === 'QIP' && document.status !== 'EN_ATTENTE') {
        throw new AppError('Ce document a deja ete traite', 403);
      }

      // Déterminer le niveau de validation
      const niveau = validatorRole === 'DLAA' || validatorRole === 'SUPER_ADMIN' ? 'DLAA' : 'QIP';

      // Create validation record avec niveau
      await prisma.validation.create({
        data: {
          documentId: document.id,
          validatorId: req.user!.id,
          status: data.status,
          niveau: niveau,
          comment: data.comment
        }
      });

      // Mettre à jour le statut du document
      const newStatus = data.status; // VALIDE ou REJETE
      
      // Si DLAA rejette, revenir à EN_ATTENTE pour re-soumission
      const finalStatus = (niveau === 'DLAA' && data.status === 'REJETE') ? 'REJETE' : newStatus;

      const updatedDocument = await prisma.document.update({
        where: { id: req.params.id as string },
        data: { status: finalStatus },
        include: {
          agent: true,
          validations: {
            include: {
              validator: {
                select: { firstName: true, lastName: true, role: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // Créer notification pour l'agent
      await prisma.notification.create({
        data: {
          userId: document.agent.userId,
          type: data.status === 'VALIDE' ? 'VALIDATION' : 'REJET',
          title: data.status === 'VALIDE' ? 'Document valide' : 'Document rejete',
          message: `Votre document ${document.type} a ete ${data.status === 'VALIDE' ? 'valide' : 'rejete'} par ${niveau}`,
          data: JSON.stringify({ documentId: document.id, niveau, comment: data.comment })
        }
      });

      // Mettre à jour le statut de l'agent selon le workflow
      const agentDocs = await prisma.document.findMany({
        where: { agentId: document.agentId }
      });

      const allValidated = agentDocs.length >= 6 && 
        agentDocs.every(d => d.status === 'VALIDE');
      
      const anyRejected = agentDocs.some(d => d.status === 'REJETE');

      // Workflow: EN_ATTENTE → DOCUMENTS_SOUMIS → QIP_VALIDE → DLAA_DELIVRE
      if (allValidated) {
        if (niveau === 'DLAA') {
          await prisma.agent.update({
            where: { id: document.agentId },
            data: { status: 'DLAA_DELIVRE' }
          });
        } else {
          await prisma.agent.update({
            where: { id: document.agentId },
            data: { status: 'QIP_VALIDE' }
          });
        }
      } else if (anyRejected) {
        await prisma.agent.update({
          where: { id: document.agentId },
          data: { status: niveau === 'DLAA' ? 'DLAA_REJETE' : 'QIP_REJETE' }
        });
      }

      res.json({ success: true, data: updatedDocument });
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

// Delete document
router.delete(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id: req.params.id as string },
        include: { agent: true }
      });

      if (!document) {
        throw new AppError('Document non trouve', 404);
      }

      // Only owner or admin can delete
      if (
        req.user!.role === 'AGENT' && 
        document.agent.userId !== req.user!.id
      ) {
        throw new AppError('Acces refuse', 403);
      }

      // Can only delete pending documents
      if (document.status !== 'EN_ATTENTE' && req.user!.role !== 'SUPER_ADMIN') {
        throw new AppError('Impossible de supprimer un document valide', 400);
      }

      await prisma.document.delete({
        where: { id: req.params.id as string }
      });

      res.json({ success: true, message: 'Document supprime' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
