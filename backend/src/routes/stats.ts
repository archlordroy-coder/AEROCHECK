import express from 'express';
import { getStore, listAgents, listLicenses, listUsers } from '../db.js';
import type { AccountLifecycleStep, AdminModule, OverviewResponse, PermissionMatrixRow, RequirementGroup, TechnologyStackGroup, WorkflowStep, Workspace } from '../../shared/api.js';
import type { AgentStatus } from '../../shared/types/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const workspaces: Workspace[] = [
  {
    role: 'agent',
    title: 'Agent ATCO',
    summary: 'Soumission des documents, suivi du dossier et consultation de la licence.',
    responsibilities: ['Completer le profil', 'Soumettre les pieces', 'Suivre les validations'],
    permissions: ['Profil', 'Documents', 'Lecture licence'],
    dashboardHighlights: ['Dossier', 'Statut', 'Echeances'],
  },
  {
    role: 'qip',
    title: 'QIP',
    summary: 'Verification premier niveau des pieces et suivi du backlog.',
    responsibilities: ['Verifier les documents', 'Rejeter avec motif', 'Suivre la file'],
    permissions: ['Lecture dossiers', 'Validation QIP'],
    dashboardHighlights: ['Backlog', 'Priors', 'Risque expiration'],
  },
  {
    role: 'dlaa',
    title: 'DLAA',
    summary: 'Emission finale des licences et controle des statuts actifs.',
    responsibilities: ['Emettre la licence', 'Mettre a jour le statut', 'Regenerer le QR code'],
    permissions: ['Lecture dossiers', 'Emission licence'],
    dashboardHighlights: ['Attente emission', 'Licences actives'],
  },
  {
    role: 'dna',
    title: 'DNA',
    summary: 'Supervision globale du workflow et de la conformite.',
    responsibilities: ['Analyser les volumes', 'Surveiller les blocages', 'Piloter le workflow'],
    permissions: ['Lecture globale', 'Tableaux de bord'],
    dashboardHighlights: ['Workflow', 'Tendances', 'Repartition'],
  },
  {
    role: 'super_admin',
    title: 'Super Admin',
    summary: 'Administration du systeme, des comptes et des referentiels.',
    responsibilities: ['Gerer les comptes', 'Administrer les referentiels', 'Auditer les actions'],
    permissions: ['CRUD comptes', 'Parametrage global'],
    dashboardHighlights: ['Utilisateurs', 'Integrite', 'Sante systeme'],
  },
];

const workflow: WorkflowStep[] = [
  { title: 'Creation du profil agent', owner: 'Agent', description: 'Le titulaire renseigne ses informations et son aeroport.', output: 'Profil pret' },
  { title: 'Soumission documentaire', owner: 'Agent', description: 'Les pieces obligatoires sont televersees avec dates et meta-donnees.', output: 'Dossier soumis' },
  { title: 'Verification QIP', owner: 'QIP', description: 'Controle premier niveau des documents et gestion des rejets motives.', output: 'Dossier QIP valide ou rejete' },
  { title: 'Emission DLAA', owner: 'DLAA', description: 'Emission finale de la licence et generation du QR code.', output: 'Licence active' },
];

const requirementGroups: RequirementGroup[] = [
  { title: 'Securite', items: ['JWT cote API', 'Controle d acces par role', 'Audit des actions sensibles'] },
  { title: 'Exploitation', items: ['Suivi des expirations', 'Backlog visible', 'Workflow lisible'] },
];

const adminModules: AdminModule[] = [
  { title: 'Comptes utilisateurs', description: 'Creation, edition, activation et suspension des comptes.', actions: ['Creer', 'Modifier', 'Activer/desactiver'], scope: 'IAM' },
  { title: 'Referentiels', description: 'Gestion des pays, aeroports, nationalites et employeurs.', actions: ['Lister', 'Mettre a jour'], scope: 'Core data' },
];

const permissionMatrix: PermissionMatrixRow[] = [
  { capability: 'Soumettre documents', agent: true, qip: false, dlaa: false, dna: false, super_admin: true },
  { capability: 'Valider documents', agent: false, qip: true, dlaa: false, dna: true, super_admin: true },
  { capability: 'Emettre licence', agent: false, qip: false, dlaa: true, dna: true, super_admin: true },
];

const accountLifecycle: AccountLifecycleStep[] = [
  { title: 'Creation', description: 'Le compte est cree par un acteur habilite.', owners: ['Super admin', 'DNA'] },
  { title: 'Activation', description: 'Le compte devient utilisable apres controle initial.', owners: ['Super admin'] },
  { title: 'Exploitation', description: 'Le compte opere selon son role et son perimetre.', owners: ['Tous les roles'] },
];

const technologyStack: TechnologyStackGroup[] = [
  { title: 'Frontend', items: ['React', 'Vite', 'Tailwind'] },
  { title: 'Backend', items: ['Express', 'TypeScript', 'JWT'] },
];

function computeStatusCounts(): Record<AgentStatus, number> {
  const base: Record<AgentStatus, number> = {
    EN_ATTENTE: 0,
    DOCUMENTS_SOUMIS: 0,
    QIP_VALIDE: 0,
    QIP_REJETE: 0,
    DLAA_DELIVRE: 0,
    DLAA_REJETE: 0,
    LICENCE_ACTIVE: 0,
    LICENCE_EXPIREE: 0,
    LICENCE_SUSPENDUE: 0,
  };

  for (const agent of listAgents()) {
    const status = agent.status as AgentStatus;
    base[status] += 1;
  }

  return base;
}

router.get('/overview', (_req, res) => {
  const store = getStore();
  const agents = listAgents();
  const documents = store.documents;
  const licenses = listLicenses();
  const agentsParStatus = computeStatusCounts();
  const licencesActives = licenses.filter((license) => license.status === 'ACTIVE').length;
  const licencesExpirees = licenses.filter((license) => license.status === 'EXPIREE').length;

  const data: OverviewResponse & {
    totalAgents: number;
    totalDocuments: number;
    documentsEnAttente: number;
    qipValides: number;
    licencesActives: number;
    licencesExpirees: number;
    agentsParStatus: Record<AgentStatus, number>;
  } = {
    productName: 'AEROCHECK',
    tagline: 'Pilotage ATCO et licences',
    description: 'Plateforme de gestion des licences aeroportuaires et du workflow documentaire.',
    objectives: ['Fluidifier les validations', 'Reduire les expirations non traitees', 'Mieux visualiser les blocages'],
    metrics: [
      { value: String(agents.length), label: 'Agents', detail: 'Profils actuellement suivis.' },
      { value: String(documents.length), label: 'Documents', detail: 'Pieces presentes dans le workflow.' },
      { value: String(licencesActives), label: 'Licences actives', detail: 'Licences actuellement valides.' },
      { value: String(documents.filter((item) => item.status === 'EN_ATTENTE').length), label: 'En attente', detail: 'Pieces encore a traiter.' },
    ],
    documents: [
      { id: 'doc-medical', title: 'Certificat medical', summary: 'Piece cle avant delivrance.', validity: '12 mois', rules: ['Doit etre valide', 'Date obligatoire'], alertWindow: 'Alerte 30 jours avant expiration' },
      { id: 'doc-competence', title: 'Controle de competence', summary: 'Verification des competences metier.', validity: '12 mois', rules: ['Controle recent', 'Piece lisible'], alertWindow: 'Alerte 45 jours avant expiration' },
      { id: 'doc-english', title: 'Niveau anglais', summary: 'Attestation ICAO niveau 4 minimum.', validity: '36 mois', rules: ['Niveau minimal 4', 'Date d emission'], alertWindow: 'Alerte 60 jours avant expiration' },
    ],
    workflow,
    workspaces,
    accountRules: [
      { title: 'Compte agent', fields: ['Nom', 'Email', 'Aeroport'], createdBy: 'Super admin', approvalRule: 'Activation avant usage.' },
      { title: 'Compte QIP/DLAA', fields: ['Nom', 'Email', 'Role'], createdBy: 'DNA ou Super admin', approvalRule: 'Role fort soumis a gouvernance.' },
    ],
    requirementGroups,
    adminModules,
    permissionMatrix,
    accountLifecycle,
    technologyStack,
    totalAgents: agents.length,
    totalDocuments: documents.length,
    documentsEnAttente: documents.filter((item) => item.status === 'EN_ATTENTE').length,
    qipValides: agentsParStatus.QIP_VALIDE,
    licencesActives,
    licencesExpirees,
    agentsParStatus,
  };

  res.json({ success: true, data });
});

router.get('/workflow', (_req, res) => {
  const agentsParStatus = computeStatusCounts();

  res.json({
    success: true,
    data: {
      workflow: {
        enAttente: agentsParStatus.EN_ATTENTE,
        documentsSoumis: agentsParStatus.DOCUMENTS_SOUMIS,
        qipValides: agentsParStatus.QIP_VALIDE,
        qipRejetes: agentsParStatus.QIP_REJETE,
        licencesActives: agentsParStatus.LICENCE_ACTIVE,
      },
      monthlyData: {
        '2026-01': { agents: 1, licenses: 0 },
        '2026-02': { agents: 1, licenses: 0 },
        '2026-03': { agents: 1, licenses: 0 },
        '2026-04': { agents: 1, licenses: 0 },
      },
    },
  });
});

router.get('/users', authenticate, authorize('SUPER_ADMIN', 'DNA'), (_req, res) => {
  const users = listUsers();
  res.json({
    success: true,
    data: {
      totalUsers: users.length,
      usersParRole: users.reduce<Record<string, number>>((acc, user) => {
        acc[user.role] = (acc[user.role] ?? 0) + 1;
        return acc;
      }, {}),
      recentUsers: users.slice(0, 5).map(({ passwordHash: _passwordHash, isActive: _isActive, paysId: _paysId, aeroportId: _aeroportId, ...safe }) => safe),
    },
  });
});

export default router;
