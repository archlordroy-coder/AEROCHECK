import type { Agent, Document, License } from '@shared/types';
import { getRequiredLicenseDocumentTypes } from '@/lib/priority-documents';

function isDocumentValid(document: Document, now = new Date()): boolean {
  if (document.status !== 'VALIDE') {
    return false;
  }

  if (!document.expiresAt) {
    return true;
  }

  return new Date(document.expiresAt) >= now;
}

export function getLicenseValiditySnapshot(agent?: Agent | null, referenceDate = new Date()) {
  const requiredTypes = getRequiredLicenseDocumentTypes(agent);
  const documents = agent?.documents ?? [];
  const requiredDocuments = requiredTypes
    .map((type) => documents.find((document) => document.type === type))
    .filter((document): document is Document => Boolean(document));
  const allRequiredDocumentsValid =
    requiredDocuments.length === requiredTypes.length &&
    requiredDocuments.every((document) => isDocumentValid(document, referenceDate));
  const nextExpiry = requiredDocuments
    .filter((document) => isDocumentValid(document, referenceDate) && document.expiresAt)
    .map((document) => new Date(document.expiresAt as string))
    .sort((left, right) => left.getTime() - right.getTime())[0];
  const daysUntilNextExpiry = nextExpiry
    ? Math.ceil((nextExpiry.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    requiredTypes,
    requiredDocuments,
    allRequiredDocumentsValid,
    nextExpiry,
    daysUntilNextExpiry,
    isExpired: !allRequiredDocumentsValid || (daysUntilNextExpiry !== null && daysUntilNextExpiry < 0),
    isExpiringSoon: allRequiredDocumentsValid && daysUntilNextExpiry !== null && daysUntilNextExpiry >= 0 && daysUntilNextExpiry <= 30,
    hasLifetimeOnly: allRequiredDocumentsValid && !nextExpiry,
  };
}

export function getLicenseMonitoringDate(agent?: Agent | null, license?: License | null) {
  return getLicenseValiditySnapshot(agent).nextExpiry ?? (license?.dateExpiration ? new Date(license.dateExpiration) : null);
}
