# Déploiement Vercel - AEROCHECK

## Structure du dossier

```
vercel/
├── .env.example          # Template des variables d'environnement
├── README.md             # Ce fichier
└── setup.sh              # Script d'aide au déploiement
```

## Prérequis

1. Compte Vercel : https://vercel.com
2. Vercel CLI installé : `npm i -g vercel`
3. Repository GitHub connecté à Vercel

## Configuration

### 1. Variables d'environnement

Copie les variables de `.env.example` dans Vercel :

```bash
# Méthode 1 : Via l'interface web
Project Settings > Environment Variables

# Méthode 2 : Via CLI
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... etc
```

### 2. Base de données

Avant le premier déploiement, configure ta base PostgreSQL :

```bash
# Option A : Supabase (gratuit)
# https://supabase.com

# Option B : Neon (gratuit)
# https://neon.tech

# Option C : Railway
# https://railway.app
```

Puis exécute les migrations :
```bash
cd backend
npx prisma migrate deploy
```

### 3. Email / SMTP

Pour les notifications, configure un service SMTP :

- **Gmail** : Active "2FA" puis génère un "App Password"
- **SendGrid** : https://sendgrid.com (100 emails/jour gratuit)
- **Mailgun** : https://mailgun.com

## Déploiement

### Méthode 1 : Git (Recommandé)

```bash
git push origin main
```

Vercel déploie automatiquement à chaque push.

### Méthode 2 : CLI

```bash
vercel

# Production
vercel --prod
```

## URLs après déploiement

- **Frontend** : `https://votre-projet.vercel.app`
- **API** : `https://votre-projet.vercel.app/api`
- **Health Check** : `https://votre-projet.vercel.app/api/health`

## Dépannage

### Erreur 404 sur /api/*
Vérifie que `vercel.json` est bien à la racine du projet.

### Erreur "DATABASE_URL not found"
Les variables d'environnement ne sont pas définies. Ajoute-les dans Vercel Dashboard.

### Erreur Prisma Client
Le build doit générer Prisma. Vérifie `buildCommand` dans `vercel.json` :
```json
"buildCommand": "pnpm install --no-frozen-lockfile && pnpm run build && cd backend && npx prisma generate"
```

### CORS Error
Vérifie les `headers` dans `vercel.json` pour l'origine correcte.

## Commandes utiles

```bash
# Voir les logs
vercel logs

# Redeploy
vercel --force

# Liste des deployments
vercel list
```
