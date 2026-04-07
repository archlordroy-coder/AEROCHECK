import type { Agent, Document, DocumentType } from '@shared/types';

export const PRIORITY_DOCUMENT_TYPES: DocumentType[] = [
  'CERTIFICAT_MEDICAL',
  'CONTROLE_COMPETENCE',
  'NIVEAU_ANGLAIS',
];

export const JUSTIFICATIF_DOCUMENT_TYPE: DocumentType = 'JUSTIFICATIF_NOMINATION';

export function requiresJustificatif(agent?: Pick<Agent, 'instructeur' | 'posteAdministratif'> | null): boolean {
  return Boolean(agent?.instructeur || (agent?.posteAdministratif && agent.posteAdministratif !== 'AUCUN'));
}

export function getRequiredLicenseDocumentTypes(agent?: Pick<Agent, 'instructeur' | 'posteAdministratif'> | null): DocumentType[] {
  return requiresJustificatif(agent)
    ? [...PRIORITY_DOCUMENT_TYPES, JUSTIFICATIF_DOCUMENT_TYPE]
    : [...PRIORITY_DOCUMENT_TYPES];
}

export function filterPriorityDocuments<T extends Pick<Document, 'type'>>(documents: T[]): T[] {
  return documents.filter((document) => PRIORITY_DOCUMENT_TYPES.includes(document.type as DocumentType));
}

export function filterLicenseDocuments<T extends Pick<Document, 'type'>>(documents: T[]): T[] {
  return documents.filter((document) =>
    PRIORITY_DOCUMENT_TYPES.includes(document.type as DocumentType) || document.type === JUSTIFICATIF_DOCUMENT_TYPE
  );
}
