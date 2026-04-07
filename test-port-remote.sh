#!/bin/bash

# Script de test pour vérifier si le port backend configuré est libre sur le serveur distant
# Utilise SSH pour se connecter au serveur défini dans .env
# Usage: ./test-port-remote.sh

set -euo pipefail

# Charger les variables depuis .env
if [ -f .env ]; then
    # shellcheck disable=SC1091
    set -a
    . ./.env
    set +a
fi

# Configuration
REMOTE_USER=${SERVER_USER:-"root"}
REMOTE_HOST=${SERVER_IP:-"82.165.150.150"}
PORT=${PORT:-${API_PORT:-3501}}
SERVER_PASS=${SERVER_PASS:-""}

# Vérifier que sshpass est installé si on a un mot de passe
if [ -n "$SERVER_PASS" ] && ! command -v sshpass &> /dev/null; then
    echo "❌ ERREUR: sshpass n'est pas installé"
    echo ""
    echo "Installez-le avec:"
    echo "  sudo apt-get install sshpass    (Ubuntu/Debian)"
    echo "  brew install sshpass             (macOS)"
    echo "  sudo yum install sshpass         (CentOS/RHEL)"
    echo ""
    echo "Ou configurez une clé SSH à la place du mot de passe."
    exit 1
fi

# Options SSH
SSH_OPTS="-o ConnectTimeout=5 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# Fonction SSH avec ou sans mot de passe
remote_exec() {
    if [ -n "$SERVER_PASS" ]; then
        export SSHPASS="$SERVER_PASS"
        sshpass -e ssh $SSH_OPTS "$REMOTE_USER@$REMOTE_HOST" "$1"
    else
        ssh $SSH_OPTS "$REMOTE_USER@$REMOTE_HOST" "$1"
    fi
}

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Test de disponibilité du port $PORT"
echo "Serveur: $REMOTE_USER@$REMOTE_HOST"
echo "=========================================="
echo ""

# Test de connexion SSH
echo "🔗 Test de connexion SSH..."
if ! remote_exec "echo 'SSH OK'" 2>/dev/null | grep -q "SSH OK"; then
    echo -e "${RED}❌ Impossible de se connecter au serveur via SSH${NC}"
    echo "Vérifiez:"
    echo "  - Que le serveur est en ligne"
    echo "  - Que l'utilisateur $REMOTE_USER existe"
    echo "  - Que le mot de passe ou la clé SSH est correct"
    exit 1
fi
echo -e "${GREEN}✅ Connexion SSH établie${NC}"
echo ""

# 1. Vérifier si le port est utilisé
echo "1. Vérification des processus utilisant le port $PORT..."
PORT_CHECK=$(remote_exec "
    if command -v lsof >/dev/null 2>&1; then lsof -i :$PORT 2>/dev/null || echo FREE;
    elif command -v netstat >/dev/null 2>&1; then netstat -tuln 2>/dev/null | grep -q ':$PORT ' && echo USED || echo FREE;
    elif command -v ss >/dev/null 2>&1; then ss -tuln 2>/dev/null | grep -q ':$PORT ' && echo USED || echo FREE;
    else echo UNKNOWN; fi
")

if echo "$PORT_CHECK" | grep -q "USED"; then
    echo -e "${RED}❌ Port $PORT est déjà utilisé${NC}"
    echo "Processus détectés:"
    remote_exec "lsof -i :$PORT 2>/dev/null || netstat -tulnp 2>/dev/null | grep ':$PORT ' || ss -tulnp 2>/dev/null | grep ':$PORT '"
elif echo "$PORT_CHECK" | grep -q "FREE"; then
    echo -e "${GREEN}✅ Port $PORT est libre${NC}"
else
    echo -e "${YELLOW}⚠️  Impossible de déterminer l'état du port${NC}"
fi
echo ""

# 2. Vérifier PM2
echo "2. Vérification des processus PM2..."
PM2_CHECK=$(remote_exec "command -v pm2 >/dev/null 2>&1 && pm2 list 2>/dev/null || echo 'NOT_INSTALLED'")

if echo "$PM2_CHECK" | grep -q "NOT_INSTALLED"; then
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé sur le serveur${NC}"
elif echo "$PM2_CHECK" | grep -q "online\|stopped"; then
    echo "Processus PM2 sur le serveur:"
    remote_exec "pm2 list 2>/dev/null | grep -E '(name|online|stopped|aerocheck)' || true"
    
    # Vérifier si aerocheck utilise le port
    AEROCHECK_RUNNING=$(remote_exec "pm2 list 2>/dev/null | grep -q 'aerocheck.*online' && echo 'YES' || echo 'NO'")
    if [ "${AEROCHECK_RUNNING:-NO}" = "YES" ]; then
        echo -e "${YELLOW}⚠️  AEROCHECK est déjà en cours d'exécution sur PM2${NC}"
    else
        echo -e "${GREEN}✅ AEROCHECK n'est pas en cours d'exécution${NC}"
    fi
else
    echo -e "${GREEN}✅ Aucun processus PM2 actif${NC}"
fi
echo ""

# 3. Vérifier le répertoire de déploiement
echo "3. Vérification du répertoire de déploiement..."
DIR_CHECK=$(remote_exec "[ -d /var/www/AEROCHECK ] && echo 'EXISTS' || echo 'NOT_EXISTS'")

if [ "$DIR_CHECK" = "EXISTS" ]; then
    echo -e "${YELLOW}⚠️  Le répertoire /var/www/AEROCHECK existe déjà${NC}"
    echo "Contenu:"
    remote_exec "ls -la /var/www/AEROCHECK/ 2>/dev/null || echo 'Accès refusé'"
else
    echo -e "${GREEN}✅ Le répertoire /var/www/AEROCHECK n'existe pas encore (sera créé)${NC}"
fi
echo ""

# 4. Test de connectivité HTTP
echo "4. Test de connectivité HTTP sur le port $PORT..."
HTTP_CHECK=$(remote_exec "curl -s -o /dev/null -w '%{http_code}' http://localhost:$PORT/api/health 2>/dev/null || echo '000'")

if [ "$HTTP_CHECK" = "200" ]; then
    echo -e "${YELLOW}⚠️  Une application répond déjà sur le port $PORT (HTTP 200)${NC}"
    remote_exec "curl -s http://localhost:$PORT/api/health 2>/dev/null | head -c 200"
elif [ "$HTTP_CHECK" = "000" ]; then
    echo -e "${GREEN}✅ Aucune application ne répond sur le port $PORT${NC}"
else
    echo -e "${YELLOW}⚠️  Réponse HTTP $HTTP_CHECK sur le port $PORT${NC}"
fi
echo ""

# Résumé
echo "=========================================="
echo "RÉSUMÉ"
echo "=========================================="

# Vérifier si tout est OK pour le déploiement
ALL_OK=true

if echo "$PORT_CHECK" | grep -q "USED"; then
    echo -e "${RED}❌ Port $PORT occupé${NC}"
    ALL_OK=false
fi

if [ "${AEROCHECK_RUNNING:-NO}" = "YES" ]; then
    echo -e "${YELLOW}⚠️  AEROCHECK déjà en cours${NC}"
fi

if [ "$HTTP_CHECK" = "200" ]; then
    echo -e "${YELLOW}⚠️  Application active sur le port $PORT${NC}"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ Le port $PORT est disponible pour le déploiement!${NC}"
    echo ""
    echo "Vous pouvez lancer le déploiement avec:"
    echo -e "${BLUE}./deploy-remote.sh${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Des conflits détectés. Résolvez-les avant de déployer.${NC}"
    echo "Pour arrêter l'ancienne instance:"
    echo "  ssh $REMOTE_USER@$REMOTE_HOST 'pm2 delete aerocheck-backend'"
    exit 1
fi
