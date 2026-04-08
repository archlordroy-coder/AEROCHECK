#!/bin/bash
set -euo pipefail

# Script de déploiement AEROCHECK pour serveur de production
# Usage: ./deploy.sh [environment]
# Environments: production (default), staging

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="aerocheck"
PROJECT_DIR="/var/www/AEROCHECK"
LOG_DIR="/var/log/pm2"
BACKUP_DIR="/var/backups/aerocheck"

# Fonctions de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est root ou sudo
if [ "$EUID" -ne 0 ]; then 
    log_warning "Ce script doit être exécuté en root ou avec sudo"
    exit 1
fi

log_info "Démarrage du déploiement AEROCHECK - Environnement: $ENVIRONMENT"

# 1. Créer les répertoires nécessaires
log_info "Création des répertoires..."
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"
chown -R root:root "$LOG_DIR"

# 2. Sauvegarde de la base de données (si elle existe)
if [ -f "$PROJECT_DIR/backend/prisma/dev.db" ]; then
    log_info "Sauvegarde de la base de données..."
    BACKUP_FILE="$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).db"
    cp "$PROJECT_DIR/backend/prisma/dev.db" "$BACKUP_FILE"
    log_success "Base de données sauvegardée: $BACKUP_FILE"
fi

# 3. Aller dans le répertoire du projet
cd "$PROJECT_DIR" || {
    log_error "Impossible d'accéder au répertoire $PROJECT_DIR"
    exit 1
}

# 4. Pull des dernières modifications
git status
log_info "Récupération des dernières modifications..."
git fetch origin
git reset --hard origin/main
log_success "Code mis à jour"

# 5. Installation des dépendances backend
log_info "Installation des dépendances backend..."
cd "$PROJECT_DIR/backend"
npm ci  # Installation propre basée sur package-lock.json

# 6. Build TypeScript
log_info "Compilation TypeScript..."
npm run build
log_success "Build terminé"

# 7. Initialisation SQLite (sans Prisma)
log_info "Initialisation de la base SQLite..."
npm run db:init
log_success "Base de données SQLite prête"

# 8. Installation des dépendances frontend (optionnel - si build statique)
# log_info "Installation des dépendances frontend..."
# cd "$PROJECT_DIR/frontend"
# npm ci
# npm run build

# 9. Créer le répertoire uploads s'il n'existe pas
mkdir -p "$PROJECT_DIR/backend/uploads"
chown -R root:root "$PROJECT_DIR/backend/uploads"
chmod 755 "$PROJECT_DIR/backend/uploads"

# 10. Configuration des permissions
log_info "Configuration des permissions..."
chown -R root:root "$PROJECT_DIR"
find "$PROJECT_DIR" -type f -exec chmod 644 {} \;
find "$PROJECT_DIR" -type d -exec chmod 755 {} \;
chmod +x "$PROJECT_DIR/backend/dist/backend/src/index.js"
log_success "Permissions configurées"

# 11. Démarrage/Redémarrage avec PM2
log_info "Gestion du processus PM2..."

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 n'est pas installé. Installation..."
    npm install -g pm2
fi

# Démarrer ou recharger l'application
if pm2 list | grep -q "$PROJECT_NAME"; then
    log_info "Redémarrage de l'application existante..."
    pm2 reload ecosystem.config.cjs --env $ENVIRONMENT
else
    log_info "Démarrage de l'application..."
    pm2 start ecosystem.config.cjs --env $ENVIRONMENT
fi

# Sauvegarder la configuration PM2
pm2 save

# 12. Configuration du démarrage automatique PM2
log_info "Configuration du démarrage automatique..."
pm2 startup systemd -u root --hp /var/www 2>/dev/null || true

# 13. Vérification de la santé
timeout=30
log_info "Vérification de la santé (timeout: ${timeout}s)..."
sleep 3

# Récupérer le port depuis le .env (PORT ou API_PORT)
APP_PORT="3009"
FRONT_PORT="3010"
if [ -f "$PROJECT_DIR/.env" ]; then
    # shellcheck disable=SC1091
    set -a
    . "$PROJECT_DIR/.env"
    set +a
    APP_PORT=${PORT:-${API_PORT:-3009}}
    FRONT_PORT=${FRONTEND_PORT:-3010}
fi
HEALTH_URL="http://localhost:$APP_PORT/api/health"

for i in $(seq 1 $timeout); do
    if curl -s "$HEALTH_URL" | grep -q "ok"; then
        log_success "Application en ligne et opérationnelle!"
        log_info "Health check: $HEALTH_URL"
        break
    fi
    
    if [ $i -eq $timeout ]; then
        log_error "L'application ne répond pas après ${timeout} secondes"
        log_info "Logs PM2:"
        pm2 logs "$PROJECT_NAME" --lines 20
        exit 1
    fi
    
    sleep 1
done

# 14. Afficher le statut
log_info "Statut du déploiement:"
pm2 status

echo ""
log_success "Déploiement AEROCHECK terminé avec succès!"
echo ""
echo -e "${GREEN}URLs:${NC}"
echo "  - Health Check: http://localhost:$APP_PORT/api/health"
echo "  - API: http://localhost:$APP_PORT/api"
echo "  - Frontend: http://localhost:$FRONT_PORT"
echo ""
echo -e "${YELLOW}Commandes utiles:${NC}"
echo "  pm2 status              - Voir le statut"
echo "  pm2 logs aerocheck-backend    - Voir les logs"
echo "  pm2 restart aerocheck-backend - Redémarrer"
echo "  pm2 stop aerocheck-backend    - Arrêter"
echo ""
