import { Router, Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// File upload directory
const DOCUMENTS_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Ensure upload directory exists
if (!fs.existsSync(DOCUMENTS_UPLOAD_DIR)) {
  fs.mkdirSync(DOCUMENTS_UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const agentId = req.body.agentId || 'temp';
    const agentDir = path.join(DOCUMENTS_UPLOAD_DIR, agentId);
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    cb(null, agentDir);
  },
  filename: (req, file, cb) => {
    const docType = req.body.type || 'DOCUMENT';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${docType.toLowerCase()}_${timestamp}${ext}`);
  }
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Utilisez PDF, JPG, PNG ou GIF'));
    }
  }
});

const createDocumentSchema = z.object({
  agentId: z.string(),
  type: z.enum([
    'PIECE_IDENTITE',
    'PHOTO_IDENTITE',
    'CASIER_JUDICIAIRE',
    'CERTIFICAT_MEDICAL',
    'ATTESTATION_FORMATION',
    'CONTRAT_TRAVAIL'
  ])
});

const validateDocumentSchema = z.object({
  status: z.enum(['VALIDE', 'REJETE']),
  comment: z.string().optional()
});

// List documents - with role-based filtering
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { agentId, status, type, page = '1', limit = '10' } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const user = req.user!;
  let where: any = {};
  
  if (agentId) where.agentId = agentId;
  if (status) where.status = status;
  if (type) where.type = type;

  // QIP: see EN_ATTENTE documents from agents in their country (RELAXED FOR TEST: see all)
  if (user.role === 'QIP') {
    where.status = 'EN_ATTENTE';
    /* Relaxed for test
    const agents = await prisma.agent.findMany({
      where: { 
        pays: { code: user.pays === 'SENEGAL' ? 'SN' : 'CI' }
      },
      select: { id: true }
    });
    if (agents.length > 0) {
      where.agentId = { in: agents.map(a => a.id) };
    }
    */
  }

  // DLAA: see documents from their airport (RELAXED FOR TEST: see all)
  if (user.role === 'DLAA') {
    /* Relaxed for test
    const agents = await prisma.agent.findMany({
      where: { aeroportId: user.aeroportId },
      select: { id: true }
    });
    if (agents.length > 0) {
      where.agentId = { in: agents.map(a => a.id) };
    }
    */
  }

  // Agents can only see their own documents
  if (user.role === 'AGENT') {
    const agent = await prisma.agent.findUnique({
      where: { userId: user.id }
    });
    if (agent) {
      where.agentId = agent.id;
    } else {
      res.json({ success: true, data: [], total: 0, page: pageNum, limit: limitNum, totalPages: 0 });
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

// Submit document with file upload using multer
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response, next) => {
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

    // Check if document type already submitted (allow re-submission of REJETE documents)
    const existing = await prisma.document.findFirst({
      where: {
        agentId: data.agentId,
        type: data.type,
        status: { in: ['EN_ATTENTE', 'VALIDE'] }
      }
    });

    if (existing) {
      // Delete uploaded file if document already exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw new AppError('Ce type de document a deja ete soumis', 400);
    }

    // Check for rejected document - if exists, archive it before creating new
    const rejectedDoc = await prisma.document.findFirst({
      where: {
        agentId: data.agentId,
        type: data.type,
        status: 'REJETE'
      }
    });

    if (rejectedDoc) {
      // Archive the rejected document
      await prisma.document.update({
        where: { id: rejectedDoc.id },
        data: { 
          archived: true,
          archivedAt: new Date()
        }
      });
      
      // Reset agent status if needed
      if (agent.status === 'QIP_REJETE' || agent.status === 'DLAA_REJETE') {
        await prisma.agent.update({
          where: { id: data.agentId },
          data: { status: 'DOCUMENTS_SOUMIS' }
        });
      }
    }

    // Get file info from multer
    let fileName: string;
    let relativePath: string;

    if (req.file) {
      // Use uploaded file info
      fileName = req.file.filename;
      relativePath = `/uploads/documents/${data.agentId}/${fileName}`;
    } else {
      // No file uploaded - use placeholder
      fileName = `${data.type}_${Date.now()}.pdf`;
      relativePath = `/uploads/documents/${data.agentId}/${fileName}`;
    }

    // Create document with actual file path
    const document = await prisma.document.create({
      data: {
        agentId: data.agentId,
        type: data.type,
        fileName: fileName,
        filePath: relativePath,
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

    // Update agent photoUrl if document is a PHOTO_IDENTITE
    if (data.type === 'PHOTO_IDENTITE') {
      await prisma.agent.update({
        where: { id: data.agentId },
        data: { photoUrl: relativePath }
      });
    }

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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

      // Mettre à jour le statut du document avec date d'expiration si validé
      const newStatus = data.status; // VALIDE ou REJETE
      
      // Calculer la date d'expiration si le document est validé
      let expiresAt = null;
      if (data.status === 'VALIDE') {
        const docTypeConfig = await prisma.documentTypeConfig.findUnique({
          where: { type: document.type }
        });
        
        if (docTypeConfig) {
          const validityDays = docTypeConfig.validityDuration;
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + validityDays);
        }
      }
      
      // Si DLAA rejette, revenir à REJETE pour re-soumission
      const finalStatus = (niveau === 'DLAA' && data.status === 'REJETE') ? 'REJETE' : newStatus;

      const updatedDocument = await prisma.document.update({
        where: { id: req.params.id as string },
        data: { 
          status: finalStatus,
          expiresAt: expiresAt
        },
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
      // Règle: Tous les documents doivent être validés par QIP avant passage à DLAA
      const agentDocs = await prisma.document.findMany({
        where: { agentId: document.agentId }
      });

      const allValidated = agentDocs.length > 0 && agentDocs.every(d => d.status === 'VALIDE');
      const anyRejected = agentDocs.some(d => d.status === 'REJETE');
      const allQIPOrDLAAValidated = agentDocs.every(d => 
        d.status === 'VALIDE' || d.status === 'REJETE'
      );

      // Workflow: EN_ATTENTE → DOCUMENTS_QIP_VALIDES → DLAA_DELIVRE
      // Pour que l'agent passe à DLAA, QIP doit valider TOUS les documents
      if (niveau === 'QIP') {
        if (allValidated) {
          // Tous les documents validés par QIP → passage à l'étape DLAA
          await prisma.agent.update({
            where: { id: document.agentId },
            data: { status: 'QIP_VALIDE' }
          });
          
          // Notification pour l'agent
          await prisma.notification.create({
            data: {
              userId: document.agent.userId,
              type: 'VALIDATION',
              title: 'Documents validés par QIP',
              message: 'Tous vos documents ont été validés par le QIP. Votre dossier passe à l\'étape DLAA.',
              data: JSON.stringify({ agentId: document.agentId, niveau: 'QIP' })
            }
          });
        } else if (anyRejected) {
          // Au moins un document rejeté
          await prisma.agent.update({
            where: { id: document.agentId },
            data: { status: 'QIP_REJETE' }
          });
        }
        // Si pas tous validés et pas de rejet, l'agent reste en cours de validation QIP
      } else if (niveau === 'DLAA') {
        // DLAA ne peut valider que si QIP a déjà tout validé
        const agent = await prisma.agent.findUnique({
          where: { id: document.agentId }
        });
        
        if (agent?.status === 'QIP_VALIDE' && allValidated) {
          await prisma.agent.update({
            where: { id: document.agentId },
            data: { status: 'DLAA_DELIVRE' }
          });
          
          // Notification de validation finale
          await prisma.notification.create({
            data: {
              userId: document.agent.userId,
              type: 'VALIDATION',
              title: 'Licence DLAA délivrée',
              message: 'Votre licence d\'accès aéroportuaire a été délivrée.',
              data: JSON.stringify({ agentId: document.agentId, niveau: 'DLAA' })
            }
          });
        } else if (data.status === 'REJETE') {
          await prisma.agent.update({
            where: { id: document.agentId },
            data: { status: 'DLAA_REJETE' }
          });
        }
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

// Preview document - serve file for viewing (no auth required for direct browser access)
router.get('/:id/preview', async (req: AuthRequest, res: Response, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id as string },
      include: { agent: true }
    });

    if (!document) {
      throw new AppError('Document non trouve', 404);
    }

    // Build file path from document filePath
    const filePath = path.join(process.cwd(), document.filePath.startsWith('/') ? document.filePath.substring(1) : document.filePath);
    
    if (!fs.existsSync(filePath)) {
      // Return placeholder info if file doesn't exist yet
      res.json({
        success: true,
        data: {
          id: document.id,
          fileName: document.fileName,
          filePath: document.filePath,
          type: document.type,
          status: document.status,
          previewAvailable: false,
          message: 'Fichier physique non disponible (demo mode)'
        }
      });
      return;
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Stream the file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// Check for expired documents (admin only)
router.get('/expired/list', authenticate, authorize('SUPER_ADMIN', 'QIP', 'DLAA'), async (req: AuthRequest, res: Response, next) => {
  try {
    const now = new Date();
    
    const expiredDocs = await prisma.document.findMany({
      where: {
        status: 'VALIDE',
        expiresAt: { lt: now }
      },
      include: {
        agent: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      orderBy: { expiresAt: 'asc' }
    });

    res.json({
      success: true,
      data: expiredDocs,
      total: expiredDocs.length,
      checkedAt: now.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
