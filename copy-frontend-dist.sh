#!/bin/bash
# Script pour copier le dist du frontend dans le dossier backend

set -e

echo "📦 Copie du frontend/dist vers backend/dist/frontend..."

# Chemins
FRONTEND_DIST="./frontend/dist"
BACKEND_DIST="./backend/dist/frontend"

# Vérifier que le dist existe
if [ ! -d "$FRONTEND_DIST" ]; then
    echo "❌ Erreur: $FRONTEND_DIST n'existe pas. Lancez 'npm run build' d'abord."
    exit 1
fi

# Créer le dossier destination
mkdir -p "$BACKEND_DIST"

# Copier les fichiers
cp -r "$FRONTEND_DIST"/* "$BACKEND_DIST/"

echo "✅ Frontend copié dans $BACKEND_DIST"
echo "📁 Contenu:"
ls -la "$BACKEND_DIST"
