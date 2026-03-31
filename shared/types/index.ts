// Enums
export type Role = 'AGENT' | 'QIP' | 'DLAA' | 'DNA' | 'SUPER_ADMIN';

export type AgentStatus = 
  | 'EN_ATTENTE'
  | 'DOCUMENTS_SOUMIS'
  | 'QIP_VALIDE'
  | 'QIP_REJETE'
  | 'DLAA_DELIVRE'
  | 'DLAA_REJETE'
  | 'LICENCE_ACTIVE'
  | 'LICENCE_EXPIREE'
  | 'LICENCE_SUSPENDUE';

export type DocumentType = 
  | 'PIECE_IDENTITE'
  | 'PHOTO_IDENTITE'
  | 'CASIER_JUDICIAIRE'
  | 'CERTIFICAT_MEDICAL'
  | 'ATTESTATION_FORMATION'
  | 'CONTRAT_TRAVAIL';

export type DocStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'EXPIRE';

export type LicenseStatus = 'ACTIVE' | 'EXPIREE' | 'SUSPENDUE' | 'REVOQUEE';

// User
export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithAgent extends User {
  agent?: Agent;
}

// Agent
export interface Agent {
  id: string;
  userId: string;
  matricule: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  adresse: string;
  fonction: string;
  employeur: string;
  aeroport: string;
  zoneAcces: string[];
  status: AgentStatus;
  documents?: Document[];
  licenses?: License[];
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// Document
export interface Document {
  id: string;
  agentId: string;
  type: DocumentType;
  fileName: string;
  filePath: string;
  status: DocStatus;
  validations?: Validation[];
  agent?: Agent;
  createdAt: string;
  updatedAt: string;
}

// Validation
export interface Validation {
  id: string;
  documentId: string;
  validatorId: string;
  status: DocStatus;
  comment?: string;
  validator?: User;
  createdAt: string;
}

// License
export interface License {
  id: string;
  agentId: string;
  numero: string;
  dateEmission: string;
  dateExpiration: string;
  status: LicenseStatus;
  qrCode?: string;
  agent?: Agent;
  createdAt: string;
  updatedAt: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Stats
export interface DashboardStats {
  totalAgents: number;
  documentsEnAttente: number;
  qipValides: number;
  licencesActives: number;
  licencesExpirees: number;
  agentsParStatus: Record<AgentStatus, number>;
}

// Document labels
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PIECE_IDENTITE: "Piece d'identite",
  PHOTO_IDENTITE: "Photo d'identite",
  CASIER_JUDICIAIRE: "Casier judiciaire",
  CERTIFICAT_MEDICAL: "Certificat medical",
  ATTESTATION_FORMATION: "Attestation de formation",
  CONTRAT_TRAVAIL: "Contrat de travail"
};

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  EN_ATTENTE: "En attente",
  VALIDE: "Valide",
  REJETE: "Rejete",
  EXPIRE: "Expire"
};

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  EN_ATTENTE: "En attente",
  DOCUMENTS_SOUMIS: "Documents soumis",
  QIP_VALIDE: "QIP valide",
  QIP_REJETE: "QIP rejete",
  DLAA_DELIVRE: "DLAA delivre",
  DLAA_REJETE: "DLAA rejete",
  LICENCE_ACTIVE: "Licence active",
  LICENCE_EXPIREE: "Licence expiree",
  LICENCE_SUSPENDUE: "Licence suspendue"
};

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  ACTIVE: "Active",
  EXPIREE: "Expiree",
  SUSPENDUE: "Suspendue",
  REVOQUEE: "Revoquee"
};

export const ROLE_LABELS: Record<Role, string> = {
  AGENT: "Agent",
  QIP: "Verificateur QIP",
  DLAA: "Agent DLAA",
  DNA: "Superviseur DNA",
  SUPER_ADMIN: "Super Administrateur"
};
