import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { addAuditLog, addDocument, addNotification, createId, enrichAgent, getAgentById, getDocumentById, getStore, removeDocument, saveDocument, touch, updateAgentDerivedStatus } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import type { Agent, Document, DocStatus } from '../../shared/types/index.js';
import { asTrimmedString, isValidDateInput, parsePositiveInt, pickEnumValue } from '../utils/validators.js';

function parseEnglishLevel(value: unknown): 4 | 5 | 6 | undefined {
  const level = Number(value);
  if (level === 4 || level === 5 || level === 6) {
    return level;
  }
  return undefined;
}

const router = express.Router();
const DOCUMENT_TYPES = ['CERTIFICAT_MEDICAL', 'CONTROLE_COMPETENCE', 'NIVEAU_ANGLAIS'] as const;
const DOCUMENT_STATUSES = ['EN_ATTENTE', 'VALIDE', 'REJETE', 'EXPIRE', 'EN_ATTENTE_DLAA'] as const;
const VALIDATION_STATUSES = ['VALIDE', 'REJETE', 'EN_ATTENTE_DLAA'] as const;

const uploadRoot = path.resolve(process.cwd(), 'uploads', 'documents');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const rawAgentId = String(req.body.agentId || 'misc');
    // Basic sanitization to prevent directory traversal
    const agentId = rawAgentId.replace(/[^a-zA-Z0-9_-]/g, ''); 
    const target = path.join(uploadRoot, agentId);
    if (!target.startsWith(uploadRoot)) {
       throw new Error('Invalid agent directory path');
    }
    fs.mkdirSync(target, { recursive: true });
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  },
});

const upload = multer({ storage });

function canAccessDocument(req: AuthRequest, document: Document): boolean {
  if (!req.user) return false;
  if (req.user.role !== 'AGENT') return true;
  const agent = getAgentById(document.agentId);
  return agent?.userId === req.user.id;
}

function canModerateDocument(req: AuthRequest): boolean {
  return req.user?.role === 'QIP' || req.user?.role === 'DLAA' || req.user?.role === 'DNA' || req.user?.role === 'SUPER_ADMIN';
}

function safelyDeleteUploadedFile(filePath?: string) {
  if (!filePath) return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}


function getRelevantDocuments(agentId?: string) {
  const base = getStore().documents;
  return agentId ? base.filter((document) => document.agentId === agentId) : base;
}

function computeDocumentExpiry(agent: Agent, type: typeof DOCUMENT_TYPES[number], issuedAt: string, englishLevel?: 4 | 5 | 6) {
  const issuedDate = new Date(issuedAt);
  let expiresAt: string | undefined;

  if (type === 'CERTIFICAT_MEDICAL') {
    const birthDate = new Date(agent.dateNaissance);
    const age = issuedDate.getFullYear() - birthDate.getFullYear() - (
      issuedDate.getMonth() < birthDate.getMonth() ||
      (issuedDate.getMonth() === birthDate.getMonth() && issuedDate.getDate() < birthDate.getDate())
        ? 1
        : 0
    );
    const validityYears = age < 40 ? 2 : 1;
    expiresAt = new Date(issuedDate.setFullYear(issuedDate.getFullYear() + validityYears)).toISOString().slice(0, 10);
  }

  if (type === 'CONTROLE_COMPETENCE') {
    const expiry = new Date(issuedAt);
    expiry.setFullYear(expiry.getFullYear() + 2);
    expiresAt = expiry.toISOString().slice(0, 10);
  }

  if (type === 'NIVEAU_ANGLAIS') {
    if (englishLevel === 4) {
      const expiry = new Date(issuedAt);
      expiry.setFullYear(expiry.getFullYear() + 3);
      expiresAt = expiry.toISOString().slice(0, 10);
    }
    if (englishLevel === 5) {
      const expiry = new Date(issuedAt);
      expiry.setFullYear(expiry.getFullYear() + 6);
      expiresAt = expiry.toISOString().slice(0, 10);
    }
    if (englishLevel === 6) {
      expiresAt = undefined;
    }
  }

  return expiresAt;
}

function getResolvedDocument(document: Document): Document {
  if (!document.expiresAt) {
    return document;
  }

  const isExpired = new Date(document.expiresAt) < new Date();
  if (!isExpired || document.status === 'REJETE' || document.status === 'EXPIRE') {
    return document;
  }

  return saveDocument(touch({ ...document, status: 'EXPIRE' }));
}

router.get('/', authenticate, (req, res) => {
  const { agentId, status, type, page = '1', limit = '20' } = req.query as Record<string, string>;
  let items: Document[] = getRelevantDocuments().map(getResolvedDocument);

  if (status && !pickEnumValue(status, DOCUMENT_STATUSES)) {
    res.status(400).json({ success: false, error: 'Statut document invalide' });
    return;
  }

  if (type && !pickEnumValue(type, DOCUMENT_TYPES)) {
    res.status(400).json({ success: false, error: 'Type de document invalide' });
    return;
  }

  if (agentId) items = items.filter((document: Document) => document.agentId === agentId);
  if (status) items = items.filter((document: Document) => document.status === status);
  if (type) items = items.filter((document: Document) => document.type === type);

  const currentPage = parsePositiveInt(page, 1);
  const perPage = parsePositiveInt(limit, 20);
  const total = items.length;
  const data = items
    .slice((currentPage - 1) * perPage, currentPage * perPage)
    .map((document: Document) => ({
      ...document,
      agent: getAgentById(document.agentId) ? enrichAgent(getAgentById(document.agentId)!) : undefined,
    }));

  res.json({
    success: true,
    data,
    total,
    page: currentPage,
    limit: perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
});

router.get('/pending', authenticate, (req: AuthRequest, res) => {
  const data = getStore().agents
    .map((agent) => enrichAgent(agent))
    .map((agent) => ({
      ...agent,
      documents: (agent.documents ?? []).map(getResolvedDocument),
    }))
    .filter((agent) => (agent.documents?.length ?? 0) > 0)
    .filter((agent) => {
      if (req.user?.role !== 'AGENT') return true;
      return agent.userId === req.user.id;
    })
    .map((agent) => {
      const total = agent.documents?.length ?? 0;
      const validated = agent.documents?.filter((document) => document.status === 'VALIDE').length ?? 0;
      const pending = agent.documents?.filter((document) => document.status === 'EN_ATTENTE').length ?? 0;
      return {
        id: agent.id,
        matricule: agent.matricule,
        firstName: agent.user?.firstName ?? '',
        lastName: agent.user?.lastName ?? '',
        airport: agent.aeroport?.nom ?? agent.aeroportId,
        fonction: agent.fonction,
        submittedAt: agent.updatedAt,
        documentCount: total,
        verifiedCount: validated,
        status: validated === total && total > 0 ? 'ready' : pending === total ? 'pending' : 'in_progress',
      };
    });

  res.json({ success: true, data });
});

router.get('/agent/:agentId', authenticate, (req: AuthRequest, res) => {
  const agent = getAgentById(req.params.agentId);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (req.user?.role === 'AGENT' && agent.userId !== req.user.id) {
    res.status(403).json({ success: false, error: 'Acces refuse a ces documents' });
    return;
  }

  const data = getRelevantDocuments(agent.id)
    .map(getResolvedDocument)
    .filter((document) => document.agentId === agent.id)
    .map((document) => ({
      id: document.id,
      type: document.type,
      fileName: document.fileName,
      status: document.status,
      uploadedAt: document.createdAt,
      verifiedAt: document.status === 'VALIDE' || document.status === 'REJETE' ? document.updatedAt : undefined,
    }));

  res.json({ success: true, data });
});

router.get('/:id', authenticate, (req: AuthRequest, res) => {
  const rawDocument = getDocumentById(req.params.id);
  const document = rawDocument ? getResolvedDocument(rawDocument) : undefined;
  if (!document) {
    res.status(404).json({ success: false, error: 'Document introuvable' });
    return;
  }

  if (!canAccessDocument(req, document)) {
    res.status(403).json({ success: false, error: 'Acces refuse a ce document' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...document,
      agent: getAgentById(document.agentId) ? enrichAgent(getAgentById(document.agentId)!) : undefined,
    },
  });
});

router.get('/:id/preview', authenticate, (req: AuthRequest, res) => {
  const rawDocument = getDocumentById(req.params.id);
  const document = rawDocument ? getResolvedDocument(rawDocument) : undefined;
  if (!document) {
    res.status(404).json({ success: false, error: 'Document introuvable' });
    return;
  }

  if (!canAccessDocument(req, document)) {
    res.status(403).json({ success: false, error: 'Acces refuse a ce document' });
    return;
  }

  const absolutePath = path.resolve(process.cwd(), document.filePath);
  if (!fs.existsSync(absolutePath)) {
    res.status(404).json({ success: false, error: 'Fichier introuvable' });
    return;
  }

  res.sendFile(absolutePath);
});

router.post('/', authenticate, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'Fichier manquant' });
    return;
  }

  const agent = getAgentById(String(req.body.agentId));
  if (!agent) {
    safelyDeleteUploadedFile(req.file.path);
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (req.user?.role === 'AGENT' && agent.userId !== req.user.id) {
    safelyDeleteUploadedFile(req.file.path);
    res.status(403).json({ success: false, error: 'Acces refuse a cet agent' });
    return;
  }

  const type = pickEnumValue(req.body.type, DOCUMENT_TYPES);
  if (!type) {
    safelyDeleteUploadedFile(req.file.path);
    res.status(400).json({ success: false, error: 'Type de document invalide' });
    return;
  }

  const rawIssuedAt = asTrimmedString(req.body.issuedAt) ?? new Date().toISOString().slice(0, 10);
  if (!isValidDateInput(rawIssuedAt)) {
    safelyDeleteUploadedFile(req.file.path);
    res.status(400).json({ success: false, error: 'Date d emission invalide' });
    return;
  }

  const issuedAt = rawIssuedAt;
  const englishLevel = parseEnglishLevel(req.body.englishLevel);
  if (type === 'NIVEAU_ANGLAIS' && !englishLevel) {
    safelyDeleteUploadedFile(req.file.path);
    res.status(400).json({ success: false, error: 'Le niveau d anglais doit etre 4, 5 ou 6' });
    return;
  }

  const document: Document = {
    id: createId('doc'),
    agentId: agent.id,
    type,
    fileName: req.file.originalname,
    filePath: path.relative(process.cwd(), req.file.path).replace(/\\/g, '/'),
    status: req.user?.role === 'QIP' ? 'EN_ATTENTE_DLAA' : 'EN_ATTENTE',
    issuedAt,
    expiresAt: computeDocumentExpiry(agent, type, issuedAt, englishLevel),
    englishLevel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addDocument(document);
  updateAgentDerivedStatus(agent.id);

  // Notify relevant parties
  if (document.status === 'EN_ATTENTE_DLAA') {
    // Notify DLAA if it skipped QIP validation
    const dlaas = getStore().users.filter(u => u.role === 'DLAA' && u.aeroportId === agent.aeroportId);
    for (const dlaa of dlaas) {
      addNotification(dlaa.id, "Nouveau document (QIP)", `Le QIP (Agent) ${agent.matricule} a soumis un document nécessitant votre approbation.`);
    }
  } else {
    // Notify QIP of the country
    const qips = getStore().users.filter(u => u.role === 'QIP' && u.paysId === agent.paysId && u.id !== req.user?.id);
    for (const qip of qips) {
      addNotification(qip.id, "Nouveau document soumis", `L'agent ${agent.matricule} a soumis un nouveau document : ${type}`);
    }
  }

  res.status(201).json({ success: true, data: document });
});

router.post('/:id/verify', authenticate, (req: AuthRequest, res) => {
  if (!canModerateDocument(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette verification' });
    return;
  }

  const document = getDocumentById(req.params.id);
  if (!document) {
    res.status(404).json({ success: false, error: 'Document introuvable' });
    return;
  }

  const role = req.user!.role;
  const action = String(req.body?.status); // 'VALIDE' or 'REJETE'
  let nextStatus: DocStatus = 'REJETE';

  if (action === 'REJETE') {
    nextStatus = 'REJETE';
  } else if (action === 'VALIDE') {
    if (role === 'QIP') {
      nextStatus = 'EN_ATTENTE_DLAA';
    } else if (role === 'DLAA') {
      if (document.status !== 'EN_ATTENTE_DLAA') {
         res.status(400).json({ success: false, error: 'Le document doit d\'abord etre valide par le QIP' });
         return;
      }
      nextStatus = 'VALIDE';
    } else if (role === 'DNA' || role === 'SUPER_ADMIN') {
      nextStatus = 'VALIDE'; // Super users can bypass
    }
  } else {
    res.status(400).json({ success: false, error: 'Action invalide' });
    return;
  }

  const saved = saveDocument(touch({ ...document, status: nextStatus }));
  updateAgentDerivedStatus(document.agentId);

  // Notifications
  const agent = getAgentById(document.agentId);
  if (agent) {
    if (nextStatus === 'REJETE') {
      addNotification(agent.userId, "Document rejeté", `Votre document ${document.type} a été rejeté. Motif: ${req.body?.comment || 'Non spécifié'}`);
    } else if (nextStatus === 'EN_ATTENTE_DLAA') {
      // Notify DLAA
      const dlaas = getStore().users.filter(u => u.role === 'DLAA' && u.paysId === agent.paysId);
      for (const dlaa of dlaas) {
        addNotification(dlaa.id, "Document en attente de validation DLAA", `Le document de l'agent ${agent.matricule} a été validé par le QIP.`);
      }
    } else if (nextStatus === 'VALIDE') {
      addNotification(agent.userId, "Document validé", `Votre document ${document.type} a été validé par le DLAA.`);
    }
  }

  addAuditLog(req.user!.id, action, `Validation du document ${document.id} (Type: ${document.type}) vers le statut ${nextStatus}`, document.id);

  res.json({ success: true, data: saved });
});

router.put('/:id/validate', authenticate, (req: AuthRequest, res) => {
  const document = getDocumentById(req.params.id);
  if (!document) {
    res.status(404).json({ success: false, error: 'Document introuvable' });
    return;
  }

  if (!canModerateDocument(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette validation' });
    return;
  }

  const nextStatus = pickEnumValue(req.body?.status, VALIDATION_STATUSES);
  if (!nextStatus) {
    res.status(400).json({ success: false, error: 'Statut de validation invalide' });
    return;
  }

  document.status = nextStatus;
  const saved = saveDocument(touch(document));
  updateAgentDerivedStatus(document.agentId);

  res.json({ success: true, data: saved });
});

router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  const document = getDocumentById(req.params.id);
  if (!document) {
    res.status(404).json({ success: false, error: 'Document introuvable' });
    return;
  }

  if (!canAccessDocument(req, document)) {
    res.status(403).json({ success: false, error: 'Acces refuse a ce document' });
    return;
  }

  const removed = removeDocument(req.params.id);
  if (!removed) {
    res.status(404).json({ success: false, error: 'Document introuvable' });
    return;
  }
  updateAgentDerivedStatus(removed.agentId);
  res.json({ success: true, data: undefined });
});

export default router;
