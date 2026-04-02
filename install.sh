#!/bin/bash
set -e

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

echo -e "${YELLOW}[1/6]${NC} Suppression des node_modules..."
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf client/node_modules
rm -rf node_modules
rm -rf backend/dist
rm -rf frontend/dist
echo -e "${GREEN}✓${NC} node_modules supprimés"

echo ""
echo -e "${YELLOW}[2/6]${NC} Installation des dépendances backend..."
cd backend
npm install
cd ..
echo -e "${GREEN}✓${NC} Backend dependencies installées"

echo ""
echo -e "${YELLOW}[3/6]${NC} Installation des dépendances frontend..."
cd frontend
npm install
cd ..
echo -e "${GREEN}✓${NC} Frontend dependencies installées"

echo ""
echo -e "${YELLOW}[4/6]${NC} Génération du client Prisma..."
cd backend
npx prisma generate
cd ..
echo -e "${GREEN}✓${NC} Prisma client généré"

echo ""
echo -e "${YELLOW}[5/6]${NC} Reset de la base de données..."
cd backend
npx prisma db push --force-reset --accept-data-loss
cd ..
echo -e "${GREEN}✓${NC} Base de données resetée"

echo ""
echo -e "${YELLOW}[6/6]${NC} Seed de la base de données..."
cd backend
npx prisma db seed
cd ..
echo -e "${GREEN}✓${NC} Base de données seedée"

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
