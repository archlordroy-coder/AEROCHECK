# Modifications AEROCHECK - Document Validation Workflow

## ✅ Modifications Déjà Implémentées

### 1. Workflow de Validation des Documents (HIGH PRIORITY)
**Fichier:** `/backend/src/routes/documents.ts`

- **Règle de validation QIP → DLAA:** Tous les documents d'un agent doivent être validés par QIP avant que l'agent puisse passer à l'étape DLAA
- **Notifications:** Ajout de notifications lors de la validation complète QIP et de la délivrance DLAA
- **Statuts agent mis à jour:**
  - `EN_ATTENTE` → `DOCUMENTS_SOUMIS` (quand documents soumis)
  - `DOCUMENTS_SOUMIS` → `QIP_VALIDE` (quand tous documents validés par QIP)
  - `QIP_VALIDE` → `DLAA_DELIVRE` (quand DLAA valide)
  - Gestion des rejets: `QIP_REJETE`, `DLAA_REJETE`

### 2. Configuration des Types de Documents (HIGH PRIORITY)
**Fichier:** `/backend/prisma/schema.prisma`

- Ajout du modèle `DocumentTypeConfig` avec:
  - `type`: Type de document (unique)
  - `validityDuration`: Durée de validité en jours
  - `isRequired`: Boolean si obligatoire

**Fichier:** `/backend/src/routes/admin.ts` (NOUVEAU)

- Endpoints admin pour configurer les types de documents:
  - `GET /api/admin/doc-type-configs` - Liste des configurations
  - `POST /api/admin/doc-type-configs` - Créer/modifier une config
  - `DELETE /api/admin/doc-type-configs/:id` - Supprimer une config
  - `POST /api/admin/init-doc-types` - Initialiser les types par défaut

### 3. Logique d'Expiration des Documents (HIGH PRIORITY)
**Fichier:** `/backend/src/routes/documents.ts`

- Calcul automatique de `expiresAt` lors de la validation d'un document
- Basé sur la configuration `validityDuration` du type de document
- Endpoint `GET /api/documents/expired/list` pour lister les documents expirés

### 4. Gestion des Resoumissions (MEDIUM PRIORITY)
**Fichier:** `/backend/src/routes/documents.ts`

- Lorsqu'un agent soumet un nouveau document d'un type déjà rejeté:
  - Archivage automatique de l'ancien document rejeté
  - Réinitialisation du statut agent si nécessaire (`QIP_REJETE` → `DOCUMENTS_SOUMIS`)

### 5. Correction de l'Ordre des Routes (BUG FIX)
**Fichier:** `/backend/src/routes/agents.ts`

- Déplacement de la route `/with-doc-stats` avant `/:id` pour éviter le conflit de routage Express

### 6. Carte Agents avec Stats sur Dashboards
**Fichiers:** `/client/pages/dashboard/QIPDashboard.tsx`, `/client/pages/dashboard/DLAADashboard.tsx`

- Affichage des agents avec leur nombre de documents validés
- Barres de progression et badges de statut
- Filtrage par pays (QIP) et aéroport (DLAA)

### 7. Prévisualisation des Documents
**Fichier:** `/client/components/ui/document-preview.tsx` (NOUVEAU)

- Modal de prévisualisation PDF/images
- Intégration dans les dashboards QIP et DLAA
- Bouton "Aperçu" sur chaque document

---

## 📋 Modifications à Venir (À Définir par l'Utilisateur)

### À Compléter:

1. 
2. 
3. 

---

## 🗒️ Notes

- Backend restart nécessaire après modifications Prisma
- Migration à appliquer: `npx prisma migrate deploy`
- Seed à réexécuter si base réinitialisée
