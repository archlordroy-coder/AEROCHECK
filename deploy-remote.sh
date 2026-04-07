#!/bin/bash

# Script de déploiement AEROCHECK - Déploiement distant via SSH
# Usage: ./deploy-remote.sh
# Inspiré du script TAKYMED avec améliorations pour AEROCHECK

set -euo pipefail

# ============================================
# CONFIGURATION - Charge depuis .env
# ============================================

if [ -f .env ]; then
    # shellcheck disable=SC1091
    set -a
    . ./.env
    set +a
fi

REMOTE_USER=${SERVER_USER:-"root"}
REMOTE_HOST=${SERVER_IP:-"82.165.150.150"}
REMOTE_DIR=${DEST_DIR:-"/var/www/AEROCHECK"}
DOMAIN=${DOMAIN:-$REMOTE_HOST}
SOURCE_DIR="$(pwd)"
APP_PORT=${PORT:-${API_PORT:-3500}}
PM2_NAME=${PM2_NAME:-"aerocheck-backend"}
SERVER_PASS=${SERVER_PASS:-""}

# SSH Control socket pour connexion persistante
CONTROL_SOCKET="/tmp/ssh-aerocheck-deploy-$USER"

# Options SSH avec ControlMaster
SSH_OPT="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ControlMaster=auto -o ControlPath=$CONTROL_SOCKET -o ControlPersist=60"

# Configuration SSH avec mot de passe
if [ -n "$SERVER_PASS" ]; then
    if ! command -v sshpass &> /dev/null; then
        echo "❌ ERREUR: sshpass n'est pas installé"
        echo "Installez-le: sudo apt-get install sshpass"
        exit 1
    fi
    export SSHPASS="$SERVER_PASS"
    SSH_CMD="sshpass -e ssh $SSH_OPT"
    RSYNC_SSH="sshpass -e ssh $SSH_OPT"
else
    SSH_CMD="ssh $SSH_OPT"
    RSYNC_SSH="ssh $SSH_OPT"
fi

echo "🚀 Démarrage du déploiement AEROCHECK"
echo "   Serveur: $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"
echo "   Port applicatif: $APP_PORT"
echo "   Domaine: $DOMAIN"
echo ""

# ============================================
# FONCTIONS
# ============================================

cleanup() {
    echo "🧹 Fermeture de la connexion SSH..."
    ssh -o ControlPath=$CONTROL_SOCKET -O exit $REMOTE_USER@$REMOTE_HOST 2>/dev/null || true
    rm -f "$CONTROL_SOCKET"
}
trap cleanup EXIT

# ============================================
# 1. ÉTABLIR CONNEXION SSH
# ============================================

echo "🔗 Établissement de la connexion SSH persistante..."
$SSH_CMD -f $REMOTE_USER@$REMOTE_HOST "exit" 2>/dev/null || true

# ============================================
# 2. PRÉPARATION DU RÉPERTOIRE DISTANT
# ============================================

echo "🛠️ Préparation du répertoire distant..."
$SSH_CMD $REMOTE_USER@$REMOTE_HOST "
    set -e
    
    # Sauvegarder le .env s'il existe
    if [ -f $REMOTE_DIR/.env ]; then
        echo '   💾 Sauvegarde du .env existant...'
        cp $REMOTE_DIR/.env /tmp/aerocheck-env-backup-\$(date +%Y%m%d-%H%M%S)
    fi
    
    # Sauvegarder la base de données SQLite si elle existe
    if [ -f $REMOTE_DIR/backend/prisma/dev.db ]; then
        echo '   💾 Sauvegarde de la base de données...'
        cp $REMOTE_DIR/backend/prisma/dev.db /tmp/aerocheck-db-backup-\$(date +%Y%m%d-%H%M%S).db
    fi
    
    # Créer la structure de répertoires
    mkdir -p $REMOTE_DIR
    mkdir -p $REMOTE_DIR/backend/uploads
    mkdir -p /var/log/pm2
    
" || { echo "❌ Échec de la préparation du répertoire distant"; exit 1; }

# ============================================
# 3. SYNCHRONISATION DES FICHIERS (RSYNC)
# ============================================

echo "📦 Synchronisation des fichiers..."
rsync -avz -e "$RSYNC_SSH" --progress "$SOURCE_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/" \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude '.vscode' \
    --exclude '.idea' \
    --exclude 'backend/prisma/dev.db' \
    --exclude 'backend/prisma/*.db-journal' \
    --exclude 'backend/uploads/*' \
    --exclude '*.log' \
    --exclude 'deploy.sh' \
    --exclude 'test-port-*.sh' \
    --exclude 'deploy-remote.sh' || { echo "❌ Échec de la synchronisation"; exit 1; }

# Synchroniser explicitement le .env local si disponible
if [ -f .env ]; then
    echo "🔐 Synchronisation du .env local vers le serveur..."
    rsync -az -e "$RSYNC_SSH" .env "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/.env" || {
        echo "❌ Impossible de copier le fichier .env sur le serveur"
        exit 1
    }
else
    echo "⚠️  Aucun .env local trouvé, conservation du .env distant existant"
fi

# ============================================
# 4. VÉRIFICATION DU .ENV
# ============================================

echo "🔍 Vérification du fichier .env sur le serveur..."
$SSH_CMD $REMOTE_USER@$REMOTE_HOST "
    if [ -f $REMOTE_DIR/.env ]; then
        echo '   ✅ Fichier .env présent'
        echo '   Variables détectées (.env):'
        grep -E '^(PORT|API_PORT|DATABASE_URL|CORS_ORIGINS|JWT_SECRET)=' $REMOTE_DIR/.env | cut -d= -f1 | sed 's/^/      /' || true
    else
        echo '   ⚠️  Fichier .env manquant! Création d'un fichier par défaut...'
        cat > $REMOTE_DIR/.env << 'EOF'
PORT=3001
DATABASE_URL=\"file:./prisma/dev.db\"
JWT_SECRET=votre_secret_jwt_a_changer_en_production
CORS_ORIGINS=http://localhost:8080,https://$DOMAIN
NODE_ENV=production
EOF
        echo '   ✅ .env créé avec les valeurs par défaut'
    fi
"

# ============================================
# 5. BUILD SUR LE SERVEUR DISTANT
# ============================================

echo "🛠️ Build sur le serveur distant..."
$SSH_CMD $REMOTE_USER@$REMOTE_HOST "
    set -e
    cd $REMOTE_DIR/backend
    
    # Vérifier Node.js
    NODE_VER=\$(node -v | cut -d. -f1 | sed 's/v//')
    if [ \"\$NODE_VER\" -lt 20 ]; then
        echo '   ⚠️  Node.js trop ancien (v\$NODE_VER), mise à jour vers v22...'
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
        apt-get install -y nodejs
    fi
    
    # Installer PM2 si nécessaire
    if ! command -v pm2 &> /dev/null; then
        echo '   📦 Installation de PM2...'
        npm install -g pm2
    fi
    
    # Installation des dépendances
    echo '   📦 npm install...'
    npm ci
    
    # Build TypeScript
    echo '   🔨 npm run build...'
    npm run build
    
    # Initialisation de la base SQLite (sans Prisma)
    echo '   🗄️  Initialisation SQLite...'
    npm run db:init
" || { echo "❌ Échec du build sur le serveur"; exit 1; }

# ============================================
# 6. CONFIGURATION DES PERMISSIONS
# ============================================

echo "🔐 Configuration des permissions..."
$SSH_CMD $REMOTE_USER@$REMOTE_HOST "
    chown -R www-data:www-data $REMOTE_DIR
    chmod 755 $REMOTE_DIR/backend/uploads
    find $REMOTE_DIR/backend -name '*.js' -exec chmod +x {} \; 2>/dev/null || true
"

# ============================================
# 7. DÉMARRAGE AVEC PM2
# ============================================

echo "🟢 Démarrage de l'application avec PM2..."
$SSH_CMD $REMOTE_USER@$REMOTE_HOST "
    cd $REMOTE_DIR
    
    # Charger les variables d'environnement
    set -a
    . ./.env
    set +a
    
    # Arrêter l'ancienne instance si elle existe
    pm2 delete $PM2_NAME 2>/dev/null || true
    
    # Démarrer la nouvelle instance
    pm2 start ecosystem.config.js --env production --update-env || \
    pm2 start ./backend/dist/index.js --name $PM2_NAME --update-env -- --port $APP_PORT
    
    # Sauvegarder la configuration
    pm2 save
    
    # Configuration du démarrage automatique
    pm2 startup systemd -u www-data --hp /var/www 2>/dev/null || true
"

# ============================================
# 8. HEALTH CHECK
# ============================================

echo "🔍 Health check..."
MAX_RETRIES=10
RETRY_COUNT=0
HEALTH_PASSED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "   Tentative $((RETRY_COUNT + 1))/$MAX_RETRIES..."
    sleep 3
    
    RESPONSE=$($SSH_CMD $REMOTE_USER@$REMOTE_HOST "curl -s http://localhost:$APP_PORT/api/health 2>/dev/null || echo ''")
    
    if [[ "$RESPONSE" == *"ok"* ]] || [[ "$RESPONSE" == *"status"* ]]; then
        echo "   ✅ Application en ligne!"
        echo "   Réponse: $RESPONSE"
        HEALTH_PASSED=true
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$HEALTH_PASSED" = false ]; then
    echo "⚠️  Health check échoué après $MAX_RETRIES tentatives"
    echo "📋 Logs PM2:"
    $SSH_CMD $REMOTE_USER@$REMOTE_HOST "pm2 logs $PM2_NAME --lines 20 || pm2 logs --lines 20"
    exit 1
fi

# ============================================
# 9. RÉSUMÉ
# ============================================

echo ""
echo "=========================================="
echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS"
echo "=========================================="
echo ""
echo "📍 Informations d'accès:"
echo "   Health Check: http://$REMOTE_HOST:$APP_PORT/api/health"
echo "   API:          http://$REMOTE_HOST:$APP_PORT/api"
echo "   Frontend:     http://$DOMAIN (si configuré)"
echo ""
echo "🔧 Commandes PM2 utiles:"
echo "   pm2 status                    - Voir le statut"
echo "   pm2 logs $PM2_NAME           - Voir les logs"
echo "   pm2 restart $PM2_NAME      - Redémarrer"
echo "   pm2 stop $PM2_NAME         - Arrêter"
echo ""
echo "🚀 Déploiement complet!"
