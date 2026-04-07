#!/bin/bash
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  AEROCHECK - Démarrage des services    ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Charger les variables depuis .env si disponible
if [ -f .env ]; then
    # shellcheck disable=SC1091
    set -a
    . ./.env
    set +a
fi

# Forcer le mode développement pour ce script (sinon npm peut ignorer les devDependencies)
export NODE_ENV=development

BACKEND_PORT=${PORT:-${API_PORT:-3300}}
FRONTEND_PORT=${FRONTEND_PORT:-3010}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm n'est pas installé${NC}"
    exit 1
fi

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Arrêt des services...${NC}"
    kill 0 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

ensure_process_running() {
    local pid="$1"
    local name="$2"
    if ! kill -0 "$pid" 2>/dev/null; then
        echo -e "${YELLOW}❌ ${name} ne s'est pas lancé correctement${NC}"
        wait "$pid" || true
        exit 1
    fi
}

# Start Backend
echo -e "${GREEN}🚀 Démarrage du Backend (localhost:${BACKEND_PORT})...${NC}"
cd "$PROJECT_ROOT/backend"
npm install --include=dev --silent
npm run db:init --silent
PORT="$BACKEND_PORT" npm run dev &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Wait a bit for backend to start
sleep 3
ensure_process_running "$BACKEND_PID" "Le backend"

# Start Frontend
echo -e "${GREEN}🚀 Démarrage du Frontend (localhost:${FRONTEND_PORT})...${NC}"
cd "$PROJECT_ROOT/frontend"
npm install --include=dev --silent
VITE_API_URL="" npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"
sleep 3
ensure_process_running "$FRONTEND_PID" "Le frontend"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Services démarrés avec succès!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "📱 Frontend: ${YELLOW}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "🔌 Backend:   ${YELLOW}http://localhost:${BACKEND_PORT}${NC}"
echo ""
echo -e "💡 ${YELLOW}Comptes de démo (mot de passe: password123):${NC}"
echo -e "   • admin@aerocheck.com (Super Admin)"
echo -e "   • qip1@aerocheck.com (QIP)"
echo -e "   • dlaa1@aerocheck.com (DLAA)"
echo -e "   • agent1@test.com (Agent)"
echo ""
echo -e "⚠️  ${YELLOW}Appuyez sur Ctrl+C pour arrêter les services${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
