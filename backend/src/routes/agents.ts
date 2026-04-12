import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { createId, enrichAgent, getAgentById, getAgentByUserId, getStore, getUserRecordById, getUserScopedAgent, listAgents, listLicenses, removeAgent, touch, upsertAgent } from '../db.js';
import type { Document } from '../../shared/types/index.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import type { Agent } from '../../shared/types/index.js';
import { asTrimmedString, parseBoolean, parsePositiveInt, parseStringArray, pickEnumValue } from '../utils/validators.js';

const router = express.Router();
const AGENT_STATUSES = ['EN_ATTENTE', 'DOCUMENTS_SOUMIS', 'QIP_VALIDE', 'QIP_REJETE', 'DLAA_DELIVRE', 'DLAA_REJETE', 'LICENCE_ACTIVE', 'LICENCE_EXPIREE', 'LICENCE_SUSPENDUE'] as const;
const GRADES = ['STAGIAIRE', 'CADET', 'JUNIOR', 'SENIOR'] as const;
const POSTES_ADMIN = ['CHEF_UNITE_ENF', 'ENA', 'QIP', 'CHARGE_EN_ROUTE', 'CHARGE_EXPLOITATION_NA', 'AUCUN'] as const;
const SEXES = ['M', 'F'] as const;
const LICENSE_STATUSES = ['VALIDE', 'EXPIREE', 'SUSPENDUE'] as const;
const photoUploadRoot = path.resolve(process.cwd(), 'uploads', 'agents');

fs.mkdirSync(photoUploadRoot, { recursive: true });

const photoStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const agentId = String(req.params.id || 'misc');
    const target = path.join(photoUploadRoot, agentId);
    fs.mkdirSync(target, { recursive: true });
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || '.jpg';
    cb(null, `photo-${Date.now()}${extension}`);
  },
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

function canAccessAgent(req: AuthRequest, agent: Agent): boolean {
  if (!req.user) return false;
  if (req.user.role === 'AGENT') {
    return agent.userId === req.user.id;
  }
  return true;
}

function buildAgentInput(body: Record<string, unknown>, existing?: Agent) {
  const payload: Partial<Agent> = {};

  if ('matricule' in body) payload.matricule = asTrimmedString(body.matricule);
  if ('dateNaissance' in body) payload.dateNaissance = asTrimmedString(body.dateNaissance);
  if ('lieuNaissance' in body) payload.lieuNaissance = asTrimmedString(body.lieuNaissance);
  if ('nationaliteId' in body) payload.nationaliteId = asTrimmedString(body.nationaliteId);
  if ('adresse' in body) payload.adresse = asTrimmedString(body.adresse);
  if ('fonction' in body) payload.fonction = asTrimmedString(body.fonction);
  if ('grade' in body) payload.grade = body.grade == null ? undefined : pickEnumValue(body.grade, GRADES);
  if ('instructeur' in body) payload.instructeur = parseBoolean(body.instructeur);
  if ('posteAdministratif' in body) payload.posteAdministratif = body.posteAdministratif == null ? undefined : pickEnumValue(body.posteAdministratif, POSTES_ADMIN);
  if ('paysId' in body) payload.paysId = asTrimmedString(body.paysId);
  if ('aeroportId' in body) payload.aeroportId = asTrimmedString(body.aeroportId);
  
  // Rule: Agents are always employed by ASECNA
  payload.employeurId = 'emp-asecna';
  if ('zoneAcces' in body) payload.zoneAcces = parseStringArray(body.zoneAcces);
  if ('status' in body) payload.status = pickEnumValue(body.status, AGENT_STATUSES);
  if ('sexe' in body) payload.sexe = body.sexe == null ? undefined : pickEnumValue(body.sexe, SEXES);
  if ('qualifications' in body) payload.qualifications = parseStringArray(body.qualifications);
  if ('licenseStatus' in body) payload.licenseStatus = body.licenseStatus == null ? undefined : pickEnumValue(body.licenseStatus, LICENSE_STATUSES);
  if ('whatsapp' in body) payload.whatsapp = body.whatsapp == null ? undefined : asTrimmedString(body.whatsapp);
  if ('photoUrl' in body) payload.photoUrl = body.photoUrl == null ? undefined : asTrimmedString(body.photoUrl);
  if ('emailVerified' in body) payload.emailVerified = parseBoolean(body.emailVerified);

  const requiredFields: Array<keyof Agent> = [
    'matricule',
    'dateNaissance',
    'lieuNaissance',
    'nationaliteId',
    'adresse',
    'fonction',
    'employeurId',
    'paysId',
    'aeroportId',
  ];

  for (const field of requiredFields) {
    if (!existing && !payload[field]) {
      return { error: `Le champ ${field} est requis` as const };
    }
  }

  if ('grade' in body && body.grade != null && !payload.grade) return { error: 'Grade invalide' as const };
  if ('instructeur' in body && payload.instructeur === undefined) return { error: 'Valeur instructeur invalide' as const };
  if ('posteAdministratif' in body && body.posteAdministratif != null && !payload.posteAdministratif) return { error: 'Poste administratif invalide' as const };
  if ('status' in body && !payload.status) return { error: 'Statut agent invalide' as const };
  if ('sexe' in body && body.sexe != null && !payload.sexe) return { error: 'Sexe invalide' as const };
  if ('zoneAcces' in body && !payload.zoneAcces) return { error: 'Zone acces invalide' as const };
  if ('qualifications' in body && !payload.qualifications) return { error: 'Qualifications invalides' as const };
  if ('licenseStatus' in body && body.licenseStatus != null && !payload.licenseStatus) return { error: 'Statut de licence invalide' as const };
  if ('emailVerified' in body && payload.emailVerified === undefined) return { error: 'Valeur emailVerified invalide' as const };

  return { payload };
}

router.get('/', authenticate, (req: AuthRequest, res) => {
  const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const scopedAgent = req.user ? getUserScopedAgent(req.user.id, req.user.role) : undefined;

  let items = listAgents();
  if (scopedAgent) {
    items = items.filter((agent) => agent.id === scopedAgent.id);
  } else if (req.user?.role === 'ENA') {
    items = items.filter((agent) => agent.aeroportId === (req.user as any).aeroportId);
  } else if (req.user?.role === 'SUP_REP' || req.user?.role === 'QIP' || req.user?.role === 'DLAA') {
    items = items.filter((agent) => agent.paysId === (req.user as any).paysId);
  } else if (req.user?.role === 'DNA' || req.user?.role === 'SUPER_ADMIN') {
    // All countries access
  }

  if (status) {
    items = items.filter((agent) => agent.status === status);
  }

  if (search) {
    const needle = search.toLowerCase();
    items = items.filter((agent) => {
      const user = getUserRecordById(agent.userId);
      return (
        agent.matricule.toLowerCase().includes(needle) ||
        `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.toLowerCase().includes(needle)
      );
    });
  }

  if (status && !pickEnumValue(status, AGENT_STATUSES)) {
    res.status(400).json({ success: false, error: 'Statut agent invalide' });
    return;
  }

  const currentPage = parsePositiveInt(page, 1);
  const perPage = parsePositiveInt(limit, 20);
  const total = items.length;
  const paged = items.slice((currentPage - 1) * perPage, currentPage * perPage).map(enrichAgent);

  res.json({
    success: true,
    data: paged,
    total,
    page: currentPage,
    limit: perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
});

router.get('/with-doc-stats', authenticate, (req: AuthRequest, res) => {
  let items = listAgents();
  if (req.user?.role === 'AGENT') {
    const ownAgent = getAgentByUserId(req.user.id);
    items = ownAgent ? [ownAgent] : [];
  }

  const data = items.map((agent) => {
    const full = enrichAgent(agent);
    return {
      id: full.id,
      matricule: full.matricule,
      firstName: full.user?.firstName ?? '',
      lastName: full.user?.lastName ?? '',
      email: full.user?.email ?? '',
      aeroport: full.aeroport?.nom ?? full.aeroportId,
      pays: full.pays?.nomFr ?? full.pays?.nom ?? full.paysId,
      status: full.status,
      documentStats: {
        total: full.documents?.length ?? 0,
        validated: full.documents?.filter((item: NonNullable<typeof full.documents>[number]) => item.status === 'VALIDE').length ?? 0,
        pending: full.documents?.filter((item: NonNullable<typeof full.documents>[number]) => item.status === 'EN_ATTENTE').length ?? 0,
        rejected: full.documents?.filter((item: NonNullable<typeof full.documents>[number]) => item.status === 'REJETE').length ?? 0,
      },
    };
  });

  res.json({ success: true, data });
});

router.get('/:id/photo', authenticate, (req, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!canAccessAgent(req as AuthRequest, agent)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette photo' });
    return;
  }

  if (agent.photoUrl) {
    res.sendFile(path.resolve(process.cwd(), agent.photoUrl.replace(/^\/+/, '')));
    return;
  }

  const photo = getStore().documents.find((document: Document) => document.agentId === agent.id && document.type === 'PHOTO_IDENTITE');
  if (!photo) {
    res.status(404).json({ success: false, error: 'Photo introuvable' });
    return;
  }

  res.sendFile(path.resolve(process.cwd(), photo.filePath));
});

router.post('/:id/photo', authenticate, photoUpload.single('photo'), (req: AuthRequest, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!canAccessAgent(req, agent)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cet agent' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ success: false, error: 'Aucun fichier photo recu' });
    return;
  }

  const nextPhotoUrl = `/uploads/agents/${agent.id}/${req.file.filename}`;
  const updatedAgent = upsertAgent(touch({ ...agent, photoUrl: nextPhotoUrl }));
  res.status(201).json({ success: true, data: enrichAgent(updatedAgent) });
});

router.get('/:id/licenses', authenticate, (req, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!canAccessAgent(req as AuthRequest, agent)) {
    res.status(403).json({ success: false, error: 'Acces refuse a ces licences' });
    return;
  }

  const items = listLicenses().filter((license) => license.agentId === req.params.id);
  res.json({ success: true, data: items });
});

router.get('/:id', authenticate, (req: AuthRequest, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!canAccessAgent(req, agent)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cet agent' });
    return;
  }

  res.json({ success: true, data: enrichAgent(agent) });
});

router.post('/', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Non authentifie' });
    return;
  }

  const targetUserId = req.user.role === 'AGENT'
    ? req.user.id
    : asTrimmedString(req.body?.userId) ?? req.user.id;
  const existingAgent = getAgentByUserId(targetUserId);
  if (existingAgent) {
    res.status(409).json({ success: false, error: 'Un agent existe deja pour cet utilisateur' });
    return;
  }

  const parsed = buildAgentInput(req.body ?? {});
  if ('error' in parsed) {
    res.status(400).json({ success: false, error: parsed.error });
    return;
  }

  const agent: Agent = {
    id: createId('agent'),
    userId: targetUserId,
    matricule: parsed.payload.matricule!,
    dateNaissance: parsed.payload.dateNaissance!,
    lieuNaissance: parsed.payload.lieuNaissance!,
    nationaliteId: parsed.payload.nationaliteId!,
    adresse: parsed.payload.adresse!,
    fonction: parsed.payload.fonction!,
    grade: parsed.payload.grade,
    instructeur: parsed.payload.instructeur ?? false,
    posteAdministratif: parsed.payload.posteAdministratif ?? 'AUCUN',
    employeurId: 'emp-asecna',
    paysId: parsed.payload.paysId!,
    aeroportId: parsed.payload.aeroportId!,
    zoneAcces: parsed.payload.zoneAcces ?? [],
    status: 'EN_ATTENTE',
    sexe: parsed.payload.sexe,
    qualifications: parsed.payload.qualifications ?? [],
    licenseStatus: parsed.payload.licenseStatus,
    whatsapp: parsed.payload.whatsapp,
    photoUrl: parsed.payload.photoUrl,
    emailVerified: parsed.payload.emailVerified ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  upsertAgent(agent);
  res.status(201).json({ success: true, data: enrichAgent(agent) });
});

router.put('/:id', authenticate, (req: AuthRequest, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!canAccessAgent(req, agent)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cet agent' });
    return;
  }

  const parsed = buildAgentInput(req.body ?? {}, agent);
  if ('error' in parsed) {
    res.status(400).json({ success: false, error: parsed.error });
    return;
  }

  const nextAgent = upsertAgent(touch({ ...agent, ...parsed.payload }));
  res.json({ success: true, data: enrichAgent(nextAgent) });
});

router.patch('/:id/status', authenticate, (req: AuthRequest, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!canAccessAgent(req, agent)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cet agent' });
    return;
  }

  const status = pickEnumValue(req.body?.status, AGENT_STATUSES);
  if (!status) {
    res.status(400).json({ success: false, error: 'Statut agent invalide' });
    return;
  }

  const nextAgent = upsertAgent(touch({ ...agent, status }));
  res.json({ success: true, data: enrichAgent(nextAgent) });
});

router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!canAccessAgent(req, agent)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cet agent' });
    return;
  }

  if (!removeAgent(req.params.id)) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }
  res.json({ success: true, data: undefined });
});

export default router;
