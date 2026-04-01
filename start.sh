#!/bin/bash

# AEROCHECK - Start script
# Lancer le backend et le frontend simultanément

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  AEROCHECK - Démarrage des services    ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

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

# Start Backend
echo -e "${GREEN}🚀 Démarrage du Backend (localhost:3001)...${NC}"
cd backend
npm install --silent 2>/dev/null || true
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo -e "${GREEN}🚀 Démarrage du Frontend (localhost:8080)...${NC}"
cd frontend
npm install --silent 2>/dev/null || true
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Services démarrés avec succès!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "📱 Frontend: ${YELLOW}http://localhost:8080${NC}"
echo -e "🔌 Backend:   ${YELLOW}http://localhost:3001${NC}"
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
