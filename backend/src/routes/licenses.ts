import express from 'express';
import QRCode from 'qrcode';
import { addLicense, createId, enrichAgent, getAgentById, getLicenseById, getLicenseDocumentValidity, getStore, listLicenses, saveLicense, touch, updateLicenseDerivedStatus, upsertAgent } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import type { Agent, Document, License } from '../../shared/types/index.js';
import { parsePositiveInt, pickEnumValue } from '../utils/validators.js';

const router = express.Router();
const LICENSE_STATUSES = ['ACTIVE', 'EXPIREE', 'SUSPENDUE', 'REVOQUEE'] as const;
const PRIORITY_DOCUMENT_TYPES = ['CERTIFICAT_MEDICAL', 'CONTROLE_COMPETENCE', 'NIVEAU_ANGLAIS'] as const;

function canManageLicenses(req: AuthRequest): boolean {
  return req.user?.role === 'DLAA' || req.user?.role === 'DNA' || req.user?.role === 'SUPER_ADMIN';
}

function getRequiredDocumentTypes(_agent: Agent) {
  return [...PRIORITY_DOCUMENT_TYPES];
}

function isDocumentExpired(document: Document) {
  return Boolean(document.expiresAt && new Date(document.expiresAt) < new Date());
}

function hasValidDocumentsForLicense(agent: Agent): boolean {
  return Boolean(getLicenseDocumentValidity(agent.id)?.allValid);
}

function getNextLicenseDocumentExpiry(agent: Agent): string | undefined {
  return getLicenseDocumentValidity(agent.id)?.nextExpiry;
}

router.get('/', authenticate, (req, res) => {
  const { agentId, status, page = '1', limit = '20' } = req.query as Record<string, string>;
  let items = listLicenses().map(updateLicenseDerivedStatus);

  if (status && !pickEnumValue(status, LICENSE_STATUSES)) {
    res.status(400).json({ success: false, error: 'Statut licence invalide' });
    return;
  }

  if (agentId) items = items.filter((license) => license.agentId === agentId);
  if (status) items = items.filter((license) => license.status === status);

  const currentPage = parsePositiveInt(page, 1);
  const perPage = parsePositiveInt(limit, 20);
  const total = items.length;
  const data = items
    .slice((currentPage - 1) * perPage, currentPage * perPage)
    .map((license) => ({
      ...license,
      agent: getAgentById(license.agentId) ? enrichAgent(getAgentById(license.agentId)!) : undefined,
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
  if (!canManageLicenses(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette liste' });
    return;
  }

  const data = getStore().agents
    .map((agent) => enrichAgent(agent))
    .filter((agent) => agent.status === 'QIP_VALIDE' || agent.status === 'LICENCE_ACTIVE')
    .map((agent) => {
      const currentLicense = (agent.licenses ?? [])[0];
      return {
        id: agent.id,
        matricule: agent.matricule,
        firstName: agent.user?.firstName ?? '',
        lastName: agent.user?.lastName ?? '',
        airport: agent.aeroport?.nom ?? agent.aeroportId,
        fonction: agent.fonction,
        approvedAt: agent.updatedAt,
        licenseType: 'AEROPORT',
        status: currentLicense ? 'issued' : 'approved',
        license: currentLicense
          ? {
              id: currentLicense.id,
              number: currentLicense.numero,
              validFrom: currentLicense.dateEmission,
              validUntil: getNextLicenseDocumentExpiry(agent),
            }
          : undefined,
      };
    });

  res.json({ success: true, data });
});

router.get('/:id', authenticate, (req, res) => {
  const license = getLicenseById(req.params.id);
  if (!license) {
    res.status(404).json({ success: false, error: 'Licence introuvable' });
    return;
  }

  res.json({ success: true, data: license });
});

router.post('/issue', authenticate, async (req: AuthRequest, res) => {
  if (!canManageLicenses(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette emission' });
    return;
  }

  const agent = getAgentById(req.body?.agentId);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!hasValidDocumentsForLicense(agent)) {
    res.status(400).json({ success: false, error: 'Tous les documents requis et valides ne sont pas encore disponibles pour cette licence' });
    return;
  }

  const issuedAt = new Date();
  const nextDocumentExpiry = getNextLicenseDocumentExpiry(agent);
  const numero = `DLAA-${issuedAt.getFullYear()}-${String(getStore().licenses.length + 1).padStart(4, '0')}`;
  const qrCode = await QRCode.toDataURL(JSON.stringify({ numero, agentId: agent.id }));

  const license: License = {
    id: createId('lic'),
    agentId: agent.id,
    numero,
    dateEmission: issuedAt.toISOString(),
    dateExpiration: nextDocumentExpiry ?? issuedAt.toISOString(),
    status: 'ACTIVE',
    qrCode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addLicense(license);
  agent.status = 'LICENCE_ACTIVE';
  upsertAgent(touch(agent));

  res.status(201).json({ success: true, data: license });
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  if (!canManageLicenses(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette emission' });
    return;
  }

  const agent = getAgentById(req.body.agentId);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent introuvable' });
    return;
  }

  if (!hasValidDocumentsForLicense(agent)) {
    res.status(400).json({ success: false, error: 'Tous les documents requis et valides ne sont pas encore disponibles pour cette licence' });
    return;
  }

  const issuedAt = new Date();
  const nextDocumentExpiry = getNextLicenseDocumentExpiry(agent);
  const numero = `DLAA-${issuedAt.getFullYear()}-${String(getStore().licenses.length + 1).padStart(4, '0')}`;
  const qrCode = await QRCode.toDataURL(JSON.stringify({ numero, agentId: agent.id }));

  const license: License = {
    id: createId('lic'),
    agentId: agent.id,
    numero,
    dateEmission: issuedAt.toISOString(),
    dateExpiration: nextDocumentExpiry ?? issuedAt.toISOString(),
    status: 'ACTIVE',
    qrCode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addLicense(license);
  agent.status = 'LICENCE_ACTIVE';
  upsertAgent(touch(agent));

  res.status(201).json({ success: true, data: license });
});

router.patch('/:id/status', authenticate, (req: AuthRequest, res) => {
  const license = getLicenseById(req.params.id);
  if (!license) {
    res.status(404).json({ success: false, error: 'Licence introuvable' });
    return;
  }

  if (!canManageLicenses(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette mise a jour' });
    return;
  }

  const status = pickEnumValue(req.body?.status, LICENSE_STATUSES);
  if (!status) {
    res.status(400).json({ success: false, error: 'Statut licence invalide' });
    return;
  }

  license.status = status;
  const saved = saveLicense(touch(license));
  res.json({ success: true, data: saved });
});

router.post('/:id/qrcode', authenticate, async (req: AuthRequest, res) => {
  const license = getLicenseById(req.params.id);
  if (!license) {
    res.status(404).json({ success: false, error: 'Licence introuvable' });
    return;
  }

  if (!canManageLicenses(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette action' });
    return;
  }

  license.qrCode = await QRCode.toDataURL(JSON.stringify({ numero: license.numero, agentId: license.agentId }));
  const saved = saveLicense(touch(license));
  res.json({ success: true, data: saved });
});

router.post('/:id/print', authenticate, (req: AuthRequest, res) => {
  const license = getLicenseById(req.params.id);
  if (!license) {
    res.status(404).json({ success: false, error: 'Licence introuvable' });
    return;
  }

  if (!canManageLicenses(req)) {
    res.status(403).json({ success: false, error: 'Acces refuse a cette action' });
    return;
  }

  res.json({
    success: true,
    data: {
      id: license.id,
      status: 'printed',
      printedAt: new Date().toISOString(),
    },
  });
});

export default router;
