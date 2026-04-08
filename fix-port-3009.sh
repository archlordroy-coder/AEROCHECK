#!/bin/bash
# Script pour libérer le port 3009 et redémarrer AEROCHECK
# Usage: sudo ./fix-port-3009.sh

set -euo pipefail

PORT=3009

echo "🔍 Vérification du port ${PORT}..."

# Vérifier si le port est utilisé
if lsof -i :${PORT} > /dev/null 2>&1; then
    echo "⚠️  Port ${PORT} est occupé par:"
    lsof -i :${PORT}
    
    echo ""
    echo "💀 Arrêt des processus sur le port ${PORT}..."
    
    # Tuer tous les processus sur ce port
    PIDS=$(lsof -t -i:${PORT})
    if [ -n "$PIDS" ]; then
        kill -9 $PIDS 2>/dev/null || true
        echo "✅ Processus tués: $PIDS"
    fi
    
    # Attendre que le port soit libéré
    sleep 2
    
    # Vérifier
    if lsof -i :${PORT} > /dev/null 2>&1; then
        echo "❌ ERREUR: Le port ${PORT} est toujours occupé"
        exit 1
    else
        echo "✅ Port ${PORT} est maintenant libre"
    fi
else
    echo "✅ Port ${PORT} est déjà libre"
fi

echo ""
echo "🚀 Redémarrage de AEROCHECK..."
cd /var/www/AEROCHECK/backend

# Vérifier PM2
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 n'est pas installé"
    exit 1
fi

# Redémarrer le backend
pm2 restart aerocheck-backend --update-env || pm2 start ecosystem.config.cjs --only aerocheck-backend

# Redémarrer le frontend
pm2 restart aerocheck-frontend --update-env || pm2 start ecosystem.config.cjs --only aerocheck-frontend

echo ""
echo "⏳ Attente du démarrage (3s)..."
sleep 3

echo ""
echo "📊 Statut PM2:"
pm2 list | grep -E "aerocheck|name|status" | head -10

echo ""
echo "🔍 Test health check:"
curl -s http://localhost:${PORT}/api/health | head -1 || echo "❌ Health check failed"

echo ""
echo "📝 Logs récents:"
pm2 logs aerocheck-backend --lines 5

echo ""
echo "✅ Terminé!"
