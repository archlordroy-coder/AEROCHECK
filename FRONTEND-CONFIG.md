# Configuration Frontend Externe

Ce document explique comment configurer le frontend AEROCHECK pour qu'il communique avec le backend via le proxy PHP (`index.php`).

## Architecture

```
┌─────────────────┐         ┌──────────────────────────┐
│   Frontend      │ ──────► │  Backend (82.165.150.150)│
│  (hébergé       │  HTTP   │  - Port: 3300            │
│   ailleurs)     │         │  - API: /api/*            │
│                 │         │  - Proxy: /index.php      │
└─────────────────┘         └──────────────────────────┘
```

## Configuration du Frontend

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du frontend avec :

```env
# URL du backend via le proxy PHP
VITE_API_URL=http://82.165.150.150:3300/index.php
```

### 2. Build du frontend

```bash
cd frontend
npm ci
npm run build
```

### 3. Déploiement du frontend

Déployez le dossier `frontend/dist` sur votre hébergement externe (Apache/Nginx/etc).

## Fonctionnement du Proxy

Le fichier `backend/index.php` agit comme un proxy qui :
1. Reçoit les requêtes HTTP du frontend
2. Ajoute les headers CORS pour permettre les requêtes cross-origin
3. Transmet la requête au backend Node.js sur le port 3300
4. Retourne la réponse au frontend

## Exemple de requête API

```javascript
// Le frontend fait une requête à :
fetch('http://82.165.150.150:3300/index.php/api/health')

// Le proxy PHP transmet au backend :
// GET http://127.0.0.1:3300/api/health
```

## URLs importantes

| Service | URL |
|---------|-----|
| Health Check | `http://82.165.150.150:3300/api/health` |
| API directe | `http://82.165.150.150:3300/api/*` |
| Proxy PHP | `http://82.165.150.150:3300/index.php` |

## Sécurité

Le proxy PHP ajoute automatiquement les headers CORS :
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

Pour restreindre l'accès, modifiez `$FRONTEND_ORIGIN` dans `backend/index.php` :
```php
$FRONTEND_ORIGIN = 'https://votre-frontend.com';
```
