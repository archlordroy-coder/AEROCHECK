#!/bin/bash
set -euo pipefail

echo "========================================"
echo "  AEROCHECK - Clean Install Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}[1/4]${NC} Suppression des node_modules..."
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf node_modules
rm -rf backend/dist
rm -rf frontend/dist
echo -e "${GREEN}✓${NC} node_modules supprimés"

echo ""
echo -e "${YELLOW}[2/5]${NC} Installation des dépendances backend..."
cd backend
npm install
cd ..
echo -e "${GREEN}✓${NC} Backend dependencies installées"

echo ""
echo -e "${YELLOW}[3/5]${NC} Installation des dépendances frontend..."
cd frontend
npm install
cd ..
echo -e "${GREEN}✓${NC} Frontend dependencies installées"

echo ""
echo -e "${YELLOW}[4/5]${NC} Initialisation du backend local..."
cd backend
npm run db:init
cd ..
echo -e "${GREEN}✓${NC} Backend local initialisé"

echo ""
echo -e "${YELLOW}[5/5]${NC} Vérification rapide des builds..."
npm run build:backend
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓${NC} Builds validés"

echo ""
echo "========================================"
echo -e "${GREEN}✅ Installation terminée avec succès !${NC}"
echo "========================================"
echo ""
echo "Pour démarrer l'application:"
echo "  ./start.sh"
echo ""
echo "Comptes de démo:"
echo "  admin@aerocheck.com    (SUPER_ADMIN)"
echo "  qip1@aerocheck.com     (QIP)"
echo "  dlaa1@aerocheck.com    (DLAA)"
echo "  agent1@test.com        (AGENT)"
echo "  Mot de passe: password123"
echo ""
