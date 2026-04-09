#!/bin/bash
# Script pour configurer le serveur en mode backend-only
# Le frontend sera hébergé sur un autre serveur et accèdera via index.php

set -euo pipefail

echo "🔧 Configuration Backend-Only AEROCHECK"
echo "======================================"

# Charger les variables d'environnement
if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

REMOTE_USER=${SERVER_USER:-"root"}
REMOTE_HOST=${SERVER_IP:-"82.165.150.150"}
REMOTE_DIR=${DEST_DIR:-"/var/www/AEROCHECK"}
APP_PORT=${PORT:-${API_PORT:-3009}}
PM2_NAME=${PM2_NAME:-"aerocheck-backend"}
FRONTEND_PM2_NAME=${FRONTEND_PM2_NAME:-"aerocheck-frontend"}

echo ""
echo "📋 Résumé de la configuration:"
echo "   - Backend: http://${REMOTE_HOST}:${APP_PORT}"
echo "   - API Proxy: http://${REMOTE_HOST}:${APP_PORT}/index.php"
echo "   - Frontend: Hébergé sur un autre serveur"
echo ""

# Connexion SSH
SSH_CMD="ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"

echo "🔌 Connexion au serveur ${REMOTE_HOST}..."

# 1. Arrêter tous les services existants
echo ""
echo "🛑 Étape 1: Arrêt des anciens services..."
$SSH_CMD "
    echo '   Arrêt de $PM2_NAME et $FRONTEND_PM2_NAME...'
    pm2 delete $PM2_NAME 2>/dev/null || echo '   Service $PM2_NAME non trouvé'
    pm2 delete $FRONTEND_PM2_NAME 2>/dev/null || echo '   Service $FRONTEND_PM2_NAME non trouvé'
    pm2 save
    echo '   ✅ Services arrêtés'
"

# 2. Vérifier la présence de index.php
echo ""
echo "📁 Étape 2: Vérification de index.php..."
$SSH_CMD "
    if [ -f ${REMOTE_DIR}/backend/index.php ]; then
        echo '   ✅ index.php présent dans backend/'
    else
        echo '   ❌ index.php manquant!'
        exit 1
    fi
"

# 3. Libérer le port
echo ""
echo "🔓 Étape 3: Libération du port ${APP_PORT}..."
$SSH_CMD "
    if lsof -i :${APP_PORT} > /dev/null 2>&1; then
        PIDS=\$(lsof -t -i:${APP_PORT})
        kill -9 \$PIDS 2>/dev/null || true
        sleep 2
        echo '   ✅ Port ${APP_PORT} libéré'
    else
        echo '   ✅ Port ${APP_PORT} déjà libre'
    fi
"

# 4. Démarrer uniquement le backend
echo ""
echo "🚀 Étape 4: Démarrage du backend uniquement..."
$SSH_CMD "
    cd ${REMOTE_DIR}
    
    # Charger l'environnement
    set -a
    . ./.env
    set +a
    
    # Démarrer le backend
    if [ -f ecosystem.config.cjs ]; then
        pm2 start ecosystem.config.cjs --env production --only $PM2_NAME --update-env || {
            pm2 start ./backend/dist/backend/src/index.js --name $PM2_NAME --update-env -- --port $APP_PORT
        }
    else
        pm2 start ./backend/dist/backend/src/index.js --name $PM2_NAME --update-env -- --port $APP_PORT
    fi
    
    pm2 save
    echo '   ✅ Backend démarré sur le port ${APP_PORT}'
"

# 5. Health check
echo ""
echo "🔍 Étape 5: Vérification du backend..."
sleep 3
RESPONSE=$($SSH_CMD "curl -s http://localhost:${APP_PORT}/api/health 2>/dev/null || echo ''")

if [[ "$RESPONSE" == *"ok"* ]] || [[ "$RESPONSE" == *"status"* ]]; then
    echo "   ✅ Backend opérationnel!"
    echo "   Réponse: $(echo $RESPONSE | cut -c1-100)"
else
    echo "   ⚠️  Backend ne répond pas correctement"
    $SSH_CMD "pm2 logs $PM2_NAME --lines 10"
    exit 1
fi

# 6. Test du proxy PHP
echo ""
echo "🔍 Étape 6: Vérification du proxy PHP..."
PHP_RESPONSE=$($SSH_CMD "curl -s http://localhost:${APP_PORT}/index.php 2>/dev/null | head -c 50 || echo ''")

if [[ "$PHP_RESPONSE" == *"error"* ]] || [ -z "$PHP_RESPONSE" ]; then
    echo "   ⚠️  index.php n'est pas accessible (normal si Apache/Nginx n'est pas configuré)"
    echo "   ℹ️  Assurez-vous que Apache/Nginx redirige les requêtes vers index.php"
else
    echo "   ✅ Proxy PHP accessible"
fi

echo ""
echo "=========================================="
echo "✅ CONFIGURATION TERMINÉE"
echo "=========================================="
echo ""
echo "📍 URLs d'accès:"
echo "   Backend API:  http://${REMOTE_HOST}:${APP_PORT}/api"
echo "   Health Check: http://${REMOTE_HOST}:${APP_PORT}/api/health"
echo "   API Proxy:    http://${REMOTE_HOST}:${APP_PORT}/index.php (pour frontend externe)"
echo ""
echo "📝 Notes:"
echo "   - Le frontend doit être hébergé sur un autre serveur"
echo "   - Le frontend doit pointer vers http://${REMOTE_HOST}:${APP_PORT}/index.php"
echo "   - Configurez Apache/Nginx pour servir index.php"
echo ""
echo "🔧 Commandes utiles:"
echo "   pm2 status              - Voir les processus"
echo "   pm2 logs $PM2_NAME    - Logs du backend"
echo "   pm2 restart $PM2_NAME - Redémarrer le backend"
echo ""
