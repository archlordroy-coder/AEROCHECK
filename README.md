# AEROCHECK

Application web de gestion des licences aeroportuaires, structuree autour du
cahier des charges `AEROCHECK_CDC_V2.0`.

## Objectif

Cette version met en place un MVP technique et produit avec :

- un frontend autonome en React + Vite
- un backend autonome en Express
- une interface recentree sur les usages metier
- une API de demonstration basee sur les roles, documents et workflows du CDC
- un panel `super admin` dedie a la gouvernance complete des donnees

## Ce qui a ete aligne avec le cahier des charges

- gestion des roles `agent`, `qip`, `dlaa`, `dna`, `super_admin`
- mise en avant des trois documents obligatoires
- rappel du double niveau de validation `QIP -> DLAA`
- exposition des regles de creation de comptes
- mise en avant des exigences de securite, audit, alertes et disponibilite
- separation claire frontend/backend pour faciliter la suite
- ajout du panel `super admin`
- ajout d'une matrice de permissions et du cycle de vie des comptes

## Architecture

### Frontend

- dossier : `client/`
- stack : React 18, React Router, TailwindCSS, Radix UI, TanStack Query
- point d'entree : `client/App.tsx`
- pages principales :
  - `client/pages/Index.tsx`
  - `client/pages/Portal.tsx`
  - `client/pages/Admin.tsx`

### Backend

- dossier : `server/`
- stack : Express + TypeScript
- point d'entree dev : `server/dev.ts`
- API :
  - `GET /api/ping`
  - `GET /api/overview`

### Contrat partage

- dossier : `shared/`
- types API : `shared/api.ts`

## Variables d'environnement

Un exemple est fourni dans `.env.example`.

Variables principales :

- `VITE_API_URL`
- `API_PORT`
- `API_BASE_URL`
- `FRONTEND_URL`
- `PING_MESSAGE`
- `JWT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## Installation

```bash
npm install --ignore-scripts
```

Note :
sur cette machine, l'installation standard a pose probleme avec `@swc/core`
et Node 25. L'option `--ignore-scripts` a permis de stabiliser l'environnement.

## Lancement

Demarrer le backend :

```bash
npm run dev:backend
```

Demarrer le frontend :

```bash
npm run dev:frontend
```

URLs par defaut :

- frontend : `http://localhost:3010`
- backend : `http://localhost:3300`

## Scripts utiles

```bash
npm run dev:frontend
npm run dev:backend
npm run build
npm run start:backend
npm run typecheck
npm run test
```

## Etat actuel du projet

Le projet est maintenant plus conforme au CDC sur le plan de l'interface
globale, mais il reste encore plusieurs briques a implementer pour passer d'un
MVP demonstratif a une application complete :

- authentification reelle
- gestion de session
- base de donnees
- upload et stockage de documents
- circuit de validation transactionnel
- notifications e-mail
- journal d'audit persistant
- filtres et tableaux metier reels
- permission matrix persistante
- panel admin transactionnel complet

## Fichiers importants

- `client/pages/Index.tsx` : centre de pilotage
- `client/pages/Portal.tsx` : vues par role
- `client/pages/Admin.tsx` : panel super admin
- `client/components/layout/SiteLayout.tsx` : shell global
- `server/index.ts` : API Express
- `server/data.ts` : donnees de demonstration metier
- `shared/api.ts` : contrats de types
- `.env.example` : variables attendues

## Prochaine etape recommandee

La suite la plus logique est :

1. ajouter une base de donnees et des modeles `users`, `documents`, `licenses`,
   `audit_logs`
2. implementer l'authentification et le RBAC reel
3. creer les ecrans transactionnels de soumission, verification et validation
4. brancher les notifications et les alertes d'expiration
