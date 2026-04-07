import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import type {
  Agent,
  AgentStatus,
  Document,
  License,
  LicenseStatus,
  Role,
  User,
} from '../shared/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(projectRoot, '.env') });

type UserRecord = User & {
  passwordHash: string;
  isActive: boolean;
  paysId?: string;
  aeroportId?: string;
};

type ReferenceItem = { id: string; code?: string; nom: string; nomFr?: string; ville?: string; paysId?: string };

interface DataStore {
  users: UserRecord[];
  agents: Agent[];
  documents: Document[];
  licenses: License[];
  nationalites: ReferenceItem[];
  employeurs: ReferenceItem[];
  pays: ReferenceItem[];
  aeroports: ReferenceItem[];
}

type ReferenceKind = 'nationalites' | 'employeurs' | 'pays' | 'aeroports';
const PRIORITY_LICENSE_DOCUMENT_TYPES = ['CERTIFICAT_MEDICAL', 'CONTROLE_COMPETENCE', 'NIVEAU_ANGLAIS'] as const;

function requiresLicenseJustificatif(agent: Pick<Agent, 'instructeur' | 'posteAdministratif'>): boolean {
  return Boolean(agent.instructeur || (agent.posteAdministratif && agent.posteAdministratif !== 'AUCUN'));
}

function getRequiredLicenseDocumentTypes(agent: Agent): Document['type'][] {
  return requiresLicenseJustificatif(agent)
    ? [...PRIORITY_LICENSE_DOCUMENT_TYPES, 'JUSTIFICATIF_NOMINATION']
    : [...PRIORITY_LICENSE_DOCUMENT_TYPES];
}

function isDocumentUsableForLicense(document: Document, now = new Date()): boolean {
  if (document.status !== 'VALIDE') {
    return false;
  }

  if (!document.expiresAt) {
    return true;
  }

  return new Date(document.expiresAt) >= now;
}

export function getLicenseDocumentValidity(agentId: string): { allValid: boolean; nextExpiry?: string } | undefined {
  const agent = getAgentById(agentId);
  if (!agent) {
    return undefined;
  }

  const now = new Date();
  const requiredTypes = getRequiredLicenseDocumentTypes(agent);
  const documents = store.documents.filter((document) => document.agentId === agentId);
  const requiredDocuments = requiredTypes.map((type) => documents.find((document) => document.type === type));
  const allValid = requiredDocuments.every((document) => document && isDocumentUsableForLicense(document, now));
  const nextExpiry = requiredDocuments
    .filter((document): document is Document => Boolean(document && isDocumentUsableForLicense(document, now) && document.expiresAt))
    .map((document) => document.expiresAt as string)
    .sort()[0];

  return { allValid, nextExpiry };
}

function resolveDbPath(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const databasePath = process.env.DATABASE_PATH?.trim();
  const backendRoot = path.resolve(projectRoot, 'backend');

  const resolveLegacyRelativePath = (rawPath: string) => {
    const normalized = rawPath.replace(/^\.\/+/, '');
    if (normalized === 'prisma/dev.db' || normalized.startsWith('prisma/')) {
      return path.resolve(backendRoot, normalized);
    }
    return path.resolve(projectRoot, rawPath);
  };

  if (databasePath) {
    return resolveLegacyRelativePath(databasePath);
  }

  if (databaseUrl?.startsWith('file:')) {
    const rawPath = databaseUrl.slice('file:'.length);
    return resolveLegacyRelativePath(rawPath);
  }

  return path.resolve(projectRoot, 'backend/prisma/dev.db');
}

const dbFilePath = resolveDbPath();
fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

const sqlite = new Database(dbFilePath);
sqlite.pragma('journal_mode = WAL');

function ensureSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      pays_id TEXT,
      aeroport_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      matricule TEXT NOT NULL UNIQUE,
      date_naissance TEXT NOT NULL,
      lieu_naissance TEXT NOT NULL,
      nationalite_id TEXT NOT NULL,
      adresse TEXT NOT NULL,
      fonction TEXT NOT NULL,
      grade TEXT,
      instructeur INTEGER NOT NULL DEFAULT 0,
      poste_administratif TEXT,
      employeur_id TEXT NOT NULL,
      pays_id TEXT NOT NULL,
      aeroport_id TEXT NOT NULL,
      zone_acces TEXT NOT NULL,
      status TEXT NOT NULL,
      sexe TEXT,
      qualifications TEXT,
      license_status TEXT,
      whatsapp TEXT,
      photo_url TEXT,
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      status TEXT NOT NULL,
      issued_at TEXT,
      expires_at TEXT,
      english_level INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      numero TEXT NOT NULL UNIQUE,
      date_emission TEXT NOT NULL,
      date_expiration TEXT NOT NULL,
      status TEXT NOT NULL,
      qr_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS references_data (
      kind TEXT NOT NULL,
      id TEXT NOT NULL,
      code TEXT,
      nom TEXT NOT NULL,
      nom_fr TEXT,
      ville TEXT,
      pays_id TEXT,
      PRIMARY KEY (kind, id)
    );
  `);
}

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function seedIfEmpty() {
  const hasUsers = sqlite.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (hasUsers.count > 0) {
    return;
  }

  const now = new Date().toISOString();
  const users: UserRecord[] = [
    makeUser('user-admin', 'SUPER_ADMIN', 'admin@aerocheck.com', 'Admin', 'Systeme'),
    makeUser('user-qip', 'QIP', 'qip1@aerocheck.com', 'Awa', 'QIP', { paysId: 'pays-cm' }),
    makeUser('user-dlaa', 'DLAA', 'dlaa1@aerocheck.com', 'Moussa', 'DLAA', { aeroportId: 'apt-dla' }),
    makeUser('user-dna', 'DNA', 'dna@aerocheck.com', 'Nadia', 'DNA'),
    makeUser('user-agent', 'AGENT', 'agent1@test.com', 'Boris', 'Mendo'),
  ];

  const agents: Agent[] = [
    makeAgent({
      id: 'agent-1',
      userId: 'user-agent',
      matricule: 'AG24001',
      status: 'QIP_VALIDE',
      paysId: 'pays-cm',
      aeroportId: 'apt-dla',
      nationaliteId: 'nat-cm',
    } as Partial<Agent> & Pick<Agent, 'id' | 'userId' | 'matricule'>),
  ];

  const documents: Document[] = [
    {
      id: 'doc-1',
      agentId: 'agent-1',
      type: 'CERTIFICAT_MEDICAL',
      fileName: 'certificat-medical.pdf',
      filePath: 'backend/uploads/documents/test/test_doc.pdf',
      status: 'VALIDE',
      issuedAt: '2026-01-15',
      expiresAt: '2027-01-15',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'doc-2',
      agentId: 'agent-1',
      type: 'CONTROLE_COMPETENCE',
      fileName: 'controle-competence.pdf',
      filePath: 'backend/uploads/documents/test/test_doc.pdf',
      status: 'VALIDE',
      issuedAt: '2026-02-10',
      expiresAt: '2027-02-10',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'doc-3',
      agentId: 'agent-1',
      type: 'NIVEAU_ANGLAIS',
      fileName: 'anglais.pdf',
      filePath: 'backend/uploads/documents/test/test_doc.pdf',
      status: 'EN_ATTENTE',
      issuedAt: '2026-03-01',
      expiresAt: '2027-03-01',
      englishLevel: 4,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const references = {
    nationalites: [
      { id: 'nat-cm', code: 'CM', nom: 'Cameroun' },
      { id: 'nat-sn', code: 'SN', nom: 'Senegal' },
      { id: 'nat-ga', code: 'GA', nom: 'Gabon' },
    ],
    employeurs: [
      { id: 'emp-asecna', nom: 'ASECNA' },
      { id: 'emp-adc', nom: 'ADC' },
    ],
    pays: [
      { id: 'pays-cm', code: 'CM', nom: 'Cameroun', nomFr: 'Cameroun' },
      { id: 'pays-sn', code: 'SN', nom: 'Senegal', nomFr: 'Senegal' },
      { id: 'pays-ga', code: 'GA', nom: 'Gabon', nomFr: 'Gabon' },
    ],
    aeroports: [
      { id: 'apt-dla', code: 'DLA', nom: 'Douala International', ville: 'Douala', paysId: 'pays-cm' },
      { id: 'apt-nbo', code: 'NSI', nom: 'Yaounde Nsimalen', ville: 'Yaounde', paysId: 'pays-cm' },
      { id: 'apt-dkr', code: 'DKR', nom: 'Blaise Diagne', ville: 'Dakar', paysId: 'pays-sn' },
    ],
  } satisfies Record<string, ReferenceItem[]>;

  const insertUser = sqlite.prepare(`
    INSERT INTO users (
      id, email, role, first_name, last_name, phone, password_hash, is_active, pays_id, aeroport_id, created_at, updated_at
    ) VALUES (
      @id, @email, @role, @firstName, @lastName, @phone, @passwordHash, @isActive, @paysId, @aeroportId, @createdAt, @updatedAt
    )
  `);

  const insertAgent = sqlite.prepare(`
    INSERT INTO agents (
      id, user_id, matricule, date_naissance, lieu_naissance, nationalite_id, adresse, fonction, grade, instructeur,
      poste_administratif, employeur_id, pays_id, aeroport_id, zone_acces, status, sexe, qualifications, license_status,
      whatsapp, photo_url, email_verified, created_at, updated_at
    ) VALUES (
      @id, @userId, @matricule, @dateNaissance, @lieuNaissance, @nationaliteId, @adresse, @fonction, @grade, @instructeur,
      @posteAdministratif, @employeurId, @paysId, @aeroportId, @zoneAcces, @status, @sexe, @qualifications, @licenseStatus,
      @whatsapp, @photoUrl, @emailVerified, @createdAt, @updatedAt
    )
  `);

  const insertDocument = sqlite.prepare(`
    INSERT INTO documents (
      id, agent_id, type, file_name, file_path, status, issued_at, expires_at, english_level, created_at, updated_at
    ) VALUES (
      @id, @agentId, @type, @fileName, @filePath, @status, @issuedAt, @expiresAt, @englishLevel, @createdAt, @updatedAt
    )
  `);

  const insertReference = sqlite.prepare(`
    INSERT INTO references_data (kind, id, code, nom, nom_fr, ville, pays_id)
    VALUES (@kind, @id, @code, @nom, @nomFr, @ville, @paysId)
  `);

  const transaction = sqlite.transaction(() => {
    for (const user of users) {
      insertUser.run({
        ...user,
        isActive: user.isActive ? 1 : 0,
      });
    }

    for (const agent of agents) {
      insertAgent.run({
        ...agent,
        instructeur: agent.instructeur ? 1 : 0,
        zoneAcces: JSON.stringify(agent.zoneAcces ?? []),
        qualifications: JSON.stringify(agent.qualifications ?? []),
        emailVerified: agent.emailVerified ? 1 : 0,
      });
    }

    for (const document of documents) {
      insertDocument.run({
        ...document,
        issuedAt: document.issuedAt ?? null,
        expiresAt: document.expiresAt ?? null,
        englishLevel: document.englishLevel ?? null,
      });
    }

    for (const [kind, items] of Object.entries(references)) {
      for (const item of items as ReferenceItem[]) {
        insertReference.run({
          kind,
          id: item.id,
          code: item.code ?? null,
          nom: item.nom,
          nomFr: item.nomFr ?? null,
          ville: item.ville ?? null,
          paysId: item.paysId ?? null,
        });
      }
    }
  });

  transaction();
}

function loadUsers(): UserRecord[] {
  const rows = sqlite.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    role: row.role as Role,
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    phone: row.phone ? String(row.phone) : undefined,
    passwordHash: String(row.password_hash),
    isActive: Number(row.is_active) === 1,
    paysId: row.pays_id ? String(row.pays_id) : undefined,
    aeroportId: row.aeroport_id ? String(row.aeroport_id) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

function loadAgents(): Agent[] {
  const rows = sqlite.prepare('SELECT * FROM agents ORDER BY created_at DESC').all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    matricule: String(row.matricule),
    dateNaissance: String(row.date_naissance),
    lieuNaissance: String(row.lieu_naissance),
    nationaliteId: String(row.nationalite_id),
    adresse: String(row.adresse),
    fonction: String(row.fonction),
    grade: row.grade ? String(row.grade) as Agent['grade'] : undefined,
    instructeur: Number(row.instructeur) === 1,
    posteAdministratif: row.poste_administratif ? String(row.poste_administratif) as Agent['posteAdministratif'] : undefined,
    employeurId: String(row.employeur_id),
    paysId: String(row.pays_id),
    aeroportId: String(row.aeroport_id),
    zoneAcces: parseJsonArray(row.zone_acces ? String(row.zone_acces) : '[]'),
    status: row.status as AgentStatus,
    sexe: row.sexe ? String(row.sexe) as Agent['sexe'] : undefined,
    qualifications: parseJsonArray(row.qualifications ? String(row.qualifications) : '[]'),
    licenseStatus: row.license_status ? String(row.license_status) as Agent['licenseStatus'] : undefined,
    whatsapp: row.whatsapp ? String(row.whatsapp) : undefined,
    photoUrl: row.photo_url ? String(row.photo_url) : undefined,
    emailVerified: Number(row.email_verified) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

function loadDocuments(): Document[] {
  const rows = sqlite.prepare('SELECT * FROM documents ORDER BY created_at DESC').all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    agentId: String(row.agent_id),
    type: row.type as Document['type'],
    fileName: String(row.file_name),
    filePath: String(row.file_path),
    status: row.status as Document['status'],
    issuedAt: row.issued_at ? String(row.issued_at) : undefined,
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    englishLevel: row.english_level ? Number(row.english_level) as 4 | 5 | 6 : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

function loadLicenses(): License[] {
  const rows = sqlite.prepare('SELECT * FROM licenses ORDER BY created_at DESC').all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    agentId: String(row.agent_id),
    numero: String(row.numero),
    dateEmission: String(row.date_emission),
    dateExpiration: String(row.date_expiration),
    status: row.status as LicenseStatus,
    qrCode: row.qr_code ? String(row.qr_code) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

function loadReferences(kind: string): ReferenceItem[] {
  const rows = sqlite.prepare('SELECT * FROM references_data WHERE kind = ? ORDER BY nom ASC').all(kind) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    code: row.code ? String(row.code) : undefined,
    nom: String(row.nom),
    nomFr: row.nom_fr ? String(row.nom_fr) : undefined,
    ville: row.ville ? String(row.ville) : undefined,
    paysId: row.pays_id ? String(row.pays_id) : undefined,
  }));
}

function loadStore(): DataStore {
  return {
    users: loadUsers(),
    agents: loadAgents(),
    documents: loadDocuments(),
    licenses: loadLicenses(),
    nationalites: loadReferences('nationalites'),
    employeurs: loadReferences('employeurs'),
    pays: loadReferences('pays'),
    aeroports: loadReferences('aeroports'),
  };
}

function replaceStore(next: DataStore) {
  store.users = next.users;
  store.agents = next.agents;
  store.documents = next.documents;
  store.licenses = next.licenses;
  store.nationalites = next.nationalites;
  store.employeurs = next.employeurs;
  store.pays = next.pays;
  store.aeroports = next.aeroports;
}

function refreshStore() {
  replaceStore(loadStore());
}

function persistUser(user: UserRecord) {
  sqlite.prepare(`
    INSERT INTO users (
      id, email, role, first_name, last_name, phone, password_hash, is_active, pays_id, aeroport_id, created_at, updated_at
    ) VALUES (
      @id, @email, @role, @firstName, @lastName, @phone, @passwordHash, @isActive, @paysId, @aeroportId, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      email = excluded.email,
      role = excluded.role,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      password_hash = excluded.password_hash,
      is_active = excluded.is_active,
      pays_id = excluded.pays_id,
      aeroport_id = excluded.aeroport_id,
      updated_at = excluded.updated_at
  `).run({
    ...user,
    isActive: user.isActive ? 1 : 0,
    phone: user.phone ?? null,
    paysId: user.paysId ?? null,
    aeroportId: user.aeroportId ?? null,
  });
}

function persistAgent(agent: Agent) {
  sqlite.prepare(`
    INSERT INTO agents (
      id, user_id, matricule, date_naissance, lieu_naissance, nationalite_id, adresse, fonction, grade, instructeur,
      poste_administratif, employeur_id, pays_id, aeroport_id, zone_acces, status, sexe, qualifications, license_status,
      whatsapp, photo_url, email_verified, created_at, updated_at
    ) VALUES (
      @id, @userId, @matricule, @dateNaissance, @lieuNaissance, @nationaliteId, @adresse, @fonction, @grade, @instructeur,
      @posteAdministratif, @employeurId, @paysId, @aeroportId, @zoneAcces, @status, @sexe, @qualifications, @licenseStatus,
      @whatsapp, @photoUrl, @emailVerified, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      matricule = excluded.matricule,
      date_naissance = excluded.date_naissance,
      lieu_naissance = excluded.lieu_naissance,
      nationalite_id = excluded.nationalite_id,
      adresse = excluded.adresse,
      fonction = excluded.fonction,
      grade = excluded.grade,
      instructeur = excluded.instructeur,
      poste_administratif = excluded.poste_administratif,
      employeur_id = excluded.employeur_id,
      pays_id = excluded.pays_id,
      aeroport_id = excluded.aeroport_id,
      zone_acces = excluded.zone_acces,
      status = excluded.status,
      sexe = excluded.sexe,
      qualifications = excluded.qualifications,
      license_status = excluded.license_status,
      whatsapp = excluded.whatsapp,
      photo_url = excluded.photo_url,
      email_verified = excluded.email_verified,
      updated_at = excluded.updated_at
  `).run({
    ...agent,
    instructeur: agent.instructeur ? 1 : 0,
    grade: agent.grade ?? null,
    posteAdministratif: agent.posteAdministratif ?? null,
    zoneAcces: JSON.stringify(agent.zoneAcces ?? []),
    sexe: agent.sexe ?? null,
    qualifications: JSON.stringify(agent.qualifications ?? []),
    licenseStatus: agent.licenseStatus ?? null,
    whatsapp: agent.whatsapp ?? null,
    photoUrl: agent.photoUrl ?? null,
    emailVerified: agent.emailVerified ? 1 : 0,
  });
}

function persistDocument(document: Document) {
  sqlite.prepare(`
    INSERT INTO documents (
      id, agent_id, type, file_name, file_path, status, issued_at, expires_at, english_level, created_at, updated_at
    ) VALUES (
      @id, @agentId, @type, @fileName, @filePath, @status, @issuedAt, @expiresAt, @englishLevel, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      agent_id = excluded.agent_id,
      type = excluded.type,
      file_name = excluded.file_name,
      file_path = excluded.file_path,
      status = excluded.status,
      issued_at = excluded.issued_at,
      expires_at = excluded.expires_at,
      english_level = excluded.english_level,
      updated_at = excluded.updated_at
  `).run({
    ...document,
    issuedAt: document.issuedAt ?? null,
    expiresAt: document.expiresAt ?? null,
    englishLevel: document.englishLevel ?? null,
  });
}

function persistLicense(license: License) {
  sqlite.prepare(`
    INSERT INTO licenses (
      id, agent_id, numero, date_emission, date_expiration, status, qr_code, created_at, updated_at
    ) VALUES (
      @id, @agentId, @numero, @dateEmission, @dateExpiration, @status, @qrCode, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      agent_id = excluded.agent_id,
      numero = excluded.numero,
      date_emission = excluded.date_emission,
      date_expiration = excluded.date_expiration,
      status = excluded.status,
      qr_code = excluded.qr_code,
      updated_at = excluded.updated_at
  `).run({
    ...license,
    qrCode: license.qrCode ?? null,
  });
}

function persistReference(kind: ReferenceKind, item: ReferenceItem) {
  sqlite.prepare(`
    INSERT INTO references_data (kind, id, code, nom, nom_fr, ville, pays_id)
    VALUES (@kind, @id, @code, @nom, @nomFr, @ville, @paysId)
    ON CONFLICT(kind, id) DO UPDATE SET
      code = excluded.code,
      nom = excluded.nom,
      nom_fr = excluded.nom_fr,
      ville = excluded.ville,
      pays_id = excluded.pays_id
  `).run({
    kind,
    id: item.id,
    code: item.code ?? null,
    nom: item.nom,
    nomFr: item.nomFr ?? null,
    ville: item.ville ?? null,
    paysId: item.paysId ?? null,
  });
}

function deleteById(table: 'agents' | 'documents' | 'licenses', id: string) {
  sqlite.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}

const now = new Date().toISOString();

function makeUser(
  id: string,
  role: Role,
  email: string,
  firstName: string,
  lastName: string,
  extra: Partial<UserRecord> = {},
): UserRecord {
  return {
    id,
    email,
    role,
    firstName,
    lastName,
    phone: extra.phone,
    createdAt: now,
    updatedAt: now,
    passwordHash: bcrypt.hashSync('password123', 10),
    isActive: true,
    paysId: extra.paysId,
    aeroportId: extra.aeroportId,
  };
}

function makeAgent(partial: Partial<Agent> & Pick<Agent, 'id' | 'userId' | 'matricule'>): Agent {
  return {
    id: partial.id,
    userId: partial.userId,
    matricule: partial.matricule,
    dateNaissance: partial.dateNaissance ?? '1990-01-01',
    lieuNaissance: partial.lieuNaissance ?? 'Douala',
    nationaliteId: partial.nationaliteId ?? 'nat-cm',
    adresse: partial.adresse ?? 'AEROCHECK',
    fonction: partial.fonction ?? 'Controleur aerien',
    grade: partial.grade ?? 'JUNIOR',
    instructeur: partial.instructeur ?? false,
    posteAdministratif: partial.posteAdministratif ?? 'AUCUN',
    employeurId: partial.employeurId ?? 'emp-asecna',
    paysId: partial.paysId ?? 'pays-cm',
    aeroportId: partial.aeroportId ?? 'apt-dla',
    zoneAcces: partial.zoneAcces ?? ['Tour', 'Piste'],
    status: partial.status ?? 'EN_ATTENTE',
    sexe: partial.sexe ?? 'M',
    qualifications: partial.qualifications ?? ['ADC'],
    licenseStatus: partial.licenseStatus ?? 'VALIDE',
    whatsapp: partial.whatsapp ?? '+237600000000',
    photoUrl: partial.photoUrl,
    emailVerified: partial.emailVerified ?? true,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

ensureSchema();
seedIfEmpty();

const store: DataStore = loadStore();

export function createId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function touch<T extends { updatedAt: string }>(record: T): T {
  record.updatedAt = new Date().toISOString();
  return record;
}

export function sanitizeUser(user: UserRecord): User {
  const { passwordHash: _passwordHash, isActive: _isActive, paysId: _paysId, aeroportId: _aeroportId, ...safe } = user;
  return safe;
}

export function getStore(): DataStore {
  return store;
}

export function getDbInfo() {
  return {
    client: 'sqlite',
    filePath: dbFilePath,
  };
}

export function getUserRecordById(id: string): UserRecord | undefined {
  return store.users.find((user) => user.id === id);
}

export function getUserRecordByEmail(email: string): UserRecord | undefined {
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function addUser(input: Omit<UserRecord, 'createdAt' | 'updatedAt'>): UserRecord {
  const user: UserRecord = {
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  persistUser(user);
  refreshStore();
  return getUserRecordById(user.id)!;
}

export function listUsers(): UserRecord[] {
  return store.users;
}

export function listAgents(): Agent[] {
  return store.agents;
}

export function getAgentById(id: string): Agent | undefined {
  return store.agents.find((agent) => agent.id === id);
}

export function getAgentByUserId(userId: string): Agent | undefined {
  return store.agents.find((agent) => agent.userId === userId);
}

export function upsertAgent(agent: Agent): Agent {
  persistAgent(agent);
  refreshStore();
  return getAgentById(agent.id)!;
}

export function removeAgent(id: string): boolean {
  if (!getAgentById(id)) return false;
  deleteById('agents', id);
  refreshStore();
  return true;
}

export function listDocuments(): Document[] {
  return store.documents;
}

export function getDocumentById(id: string): Document | undefined {
  return store.documents.find((document) => document.id === id);
}

export function addDocument(document: Document): Document {
  persistDocument(document);
  refreshStore();
  return getDocumentById(document.id)!;
}

export function removeDocument(id: string): Document | undefined {
  const existing = getDocumentById(id);
  if (!existing) return undefined;
  deleteById('documents', id);
  refreshStore();
  return existing;
}

export function listLicenses(): License[] {
  return store.licenses;
}

export function getLicenseById(id: string): License | undefined {
  return store.licenses.find((license) => license.id === id);
}

export function addLicense(license: License): License {
  persistLicense(license);
  refreshStore();
  return getLicenseById(license.id)!;
}

export function getUserScopedAgent(userId: string, role: Role): Agent | undefined {
  if (role === 'AGENT') {
    return getAgentByUserId(userId);
  }
  return undefined;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export function getRelations() {
  return {
    nationalites: store.nationalites,
    employeurs: store.employeurs,
    pays: store.pays,
    aeroports: store.aeroports,
  };
}

export function getAirportById(id: string) {
  return store.aeroports.find((item) => item.id === id);
}

export function saveReference(kind: ReferenceKind, item: ReferenceItem): ReferenceItem {
  persistReference(kind, item);
  refreshStore();
  const collection = getRelations()[kind];
  return collection.find((entry) => entry.id === item.id) ?? item;
}

export function saveAirport(item: ReferenceItem): ReferenceItem {
  return saveReference('aeroports', item);
}

export function enrichAgent(agent: Agent): Agent {
  const user = getUserRecordById(agent.userId);
  const docItems = store.documents.filter((document) => document.agentId === agent.id);
  const licenseItems = store.licenses.filter((license) => license.agentId === agent.id);

  return {
    ...agent,
    user: user ? sanitizeUser(user) : undefined,
    documents: docItems,
    licenses: licenseItems,
    nationalite: store.nationalites.find((item) => item.id === agent.nationaliteId) as Agent['nationalite'],
    employeur: store.employeurs.find((item) => item.id === agent.employeurId) as Agent['employeur'],
    pays: store.pays.find((item) => item.id === agent.paysId) as Agent['pays'],
    aeroport: store.aeroports.find((item) => item.id === agent.aeroportId) as Agent['aeroport'],
  };
}

export function updateAgentDerivedStatus(agentId: string): void {
  const agent = getAgentById(agentId);
  if (!agent) return;

  const agentDocuments = store.documents.filter((document) => document.agentId === agentId);
  const allValidated = agentDocuments.length > 0 && agentDocuments.every((document) => document.status === 'VALIDE');
  const hasRejected = agentDocuments.some((document) => document.status === 'REJETE');

  let nextStatus: AgentStatus = agent.status;
  if (hasRejected) {
    nextStatus = 'QIP_REJETE';
  } else if (allValidated) {
    nextStatus = 'QIP_VALIDE';
  } else if (agentDocuments.length > 0) {
    nextStatus = 'DOCUMENTS_SOUMIS';
  }

  agent.status = nextStatus;
  upsertAgent(touch(agent));
}

export function updateLicenseDerivedStatus(license: License): License {
  const validity = getLicenseDocumentValidity(license.agentId);
  let status: LicenseStatus = license.status;

  if (status !== 'SUSPENDUE' && status !== 'REVOQUEE') {
    status = validity?.allValid ? 'ACTIVE' : 'EXPIREE';
  }

  if (validity?.nextExpiry) {
    license.dateExpiration = validity.nextExpiry;
  }

  license.status = status;
  persistLicense(touch(license));
  refreshStore();
  return getLicenseById(license.id)!;
}

export function saveDocument(document: Document): Document {
  persistDocument(document);
  refreshStore();
  return getDocumentById(document.id)!;
}

export function saveLicense(license: License): License {
  persistLicense(license);
  refreshStore();
  return getLicenseById(license.id)!;
}

export function saveUser(user: UserRecord): UserRecord {
  persistUser(user);
  refreshStore();
  return getUserRecordById(user.id)!;
}

export const dbHelpers = {
  getById(table: string, id: string) {
    if (table === 'User') return getUserRecordById(id);
    if (table === 'Agent') return getAgentById(id);
    if (table === 'Document') return getDocumentById(id);
    if (table === 'License') return getLicenseById(id);
    return undefined;
  },
};
