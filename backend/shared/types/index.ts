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
export type Sexe = 'M' | 'F';

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
  nationaliteId: string;
  adresse: string;
  fonction: string;
  employeurId: string;
  paysId: string;
  aeroportId: string;
  zoneAcces: string[];
  status: AgentStatus;
  sexe?: Sexe;
  qualifications?: string[];
  whatsapp?: string;
  photoUrl?: string;
  emailVerified: boolean;
  documents?: Document[];
  licenses?: License[];
  user?: User;
  nationalite?: { id: string; code: string; nom: string };
  employeur?: { id: string; nom: string };
  pays?: { id: string; code: string; nom: string; nomFr: string };
  aeroport?: { id: string; code: string; nom: string; ville: string };
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
  // ATCO specific fields
  matricule?: string;
  paysId?: string;
  aeroportId?: string;
  sexe?: Sexe;
  qualifications?: string[];
  whatsapp?: string;
  dateNaissance?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Stats
export interface DashboardStats {
  totalAgents: number;
  totalDocuments: number;
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

// African Countries - ASECNA Member States and other African countries
export const AFRICAN_COUNTRIES = [
  { code: 'BENIN', name: 'Bénin', flag: '🇧🇯' },
  { code: 'BURKINA_FASO', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'CAMEROUN', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'CENTRAFRIQUE', name: 'Centrafrique', flag: '🇨🇫' },
  { code: 'COMORES', name: 'Comores', flag: '🇰🇲' },
  { code: 'CONGO', name: 'Congo', flag: '🇨🇬' },
  { code: 'COTE_D_IVOIRE', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'DJIBOUTI', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'GABON', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GUINEE_BISSAU', name: 'Guinée-Bissau', flag: '🇬🇼' },
  { code: 'GUINEE_CONAKRY', name: 'Guinée-Conakry', flag: '🇬🇳' },
  { code: 'MADAGASCAR', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MALI', name: 'Mali', flag: '🇲🇱' },
  { code: 'MAURITANIE', name: 'Mauritanie', flag: '🇲🇷' },
  { code: 'NIGER', name: 'Niger', flag: '🇳🇪' },
  { code: 'SENEGAL', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'TCHAD', name: 'Tchad', flag: '🇹🇩' },
  { code: 'TOGO', name: 'Togo', flag: '🇹🇬' },
  // Additional African countries
  { code: 'ALGERIE', name: 'Algérie', flag: '🇩🇿' },
  { code: 'ANGOLA', name: 'Angola', flag: '🇦🇴' },
  { code: 'BOTSWANA', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BURUNDI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'CAP_VERT', name: 'Cap-Vert', flag: '🇨🇻' },
  { code: 'EGYPTE', name: 'Égypte', flag: '🇪🇬' },
  { code: 'ERYTHREE', name: 'Érythrée', flag: '🇪🇷' },
  { code: 'ESWATINI', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'ETHIOPIE', name: 'Éthiopie', flag: '🇪🇹' },
  { code: 'GAMBIE', name: 'Gambie', flag: '🇬🇲' },
  { code: 'GHANA', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GUINEE_EQUATORIALE', name: 'Guinée équatoriale', flag: '🇬🇶' },
  { code: 'KENYA', name: 'Kenya', flag: '🇰🇪' },
  { code: 'LESOTHO', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LIBERIA', name: 'Libéria', flag: '🇱🇷' },
  { code: 'LIBYE', name: 'Libye', flag: '🇱🇾' },
  { code: 'MAROC', name: 'Maroc', flag: '🇲🇦' },
  { code: 'MALAWI', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MAURICE', name: 'Maurice', flag: '🇲🇺' },
  { code: 'MOZAMBIQUE', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'NAMIBIE', name: 'Namibie', flag: '🇳🇦' },
  { code: 'NIGERIA', name: 'Nigéria', flag: '🇳🇬' },
  { code: 'OUGANDA', name: 'Ouganda', flag: '🇺🇬' },
  { code: 'RWANDA', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'SAO_TOME', name: 'Sao Tomé-et-Principe', flag: '🇸🇹' },
  { code: 'SEYCHELLES', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SIERRA_LEONE', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SOMALIE', name: 'Somalie', flag: '🇸🇴' },
  { code: 'SOUDAN', name: 'Soudan', flag: '🇸🇩' },
  { code: 'SOUDAN_DU_SUD', name: 'Soudan du Sud', flag: '🇸🇸' },
  { code: 'TANZANIE', name: 'Tanzanie', flag: '🇹🇿' },
  { code: 'ZAMBIE', name: 'Zambie', flag: '🇿🇲' },
  { code: 'ZIMBABWE', name: 'Zimbabwe', flag: '🇿🇼' }
] as const;

export type AfricanCountryCode = typeof AFRICAN_COUNTRIES[number]['code'];

export const COUNTRY_LABELS: Record<string, string> = AFRICAN_COUNTRIES.reduce((acc, country) => {
  acc[country.code] = `${country.flag} ${country.name}`;
  return acc;
}, {} as Record<string, string>);
