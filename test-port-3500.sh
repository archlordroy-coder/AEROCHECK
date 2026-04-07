#!/bin/bash

# Script de test pour vérifier si le port 3500 est libre
# Usage: ./test-port-3500.sh

set -e

PORT=3500

echo "=========================================="
echo "Test de disponibilité du port $PORT"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction pour vérifier si un port est utilisé
check_port_in_use() {
    if command -v lsof &> /dev/null; then
        lsof -i :$PORT &> /dev/null && return 0
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$PORT " && return 0
    elif command -v ss &> /dev/null; then
        ss -tuln | grep -q ":$PORT " && return 0
    fi
    return 1
}

# 1. Vérifier si le port est déjà utilisé
echo "1. Vérification des processus utilisant le port $PORT..."
if check_port_in_use; then
    echo -e "${RED}❌ Port $PORT est déjà utilisé${NC}"
    echo "Processus détectés:"
    if command -v lsof &> /dev/null; then
        lsof -i :$PORT 2>/dev/null || true
    elif command -v netstat &> /dev/null; then
        netstat -tulnp 2>/dev/null | grep ":$PORT " || true
    elif command -v ss &> /dev/null; then
        ss -tulnp | grep ":$PORT " || true
    fi
    echo ""
else
    echo -e "${GREEN}✅ Port $PORT est libre${NC}"
    echo ""
fi

# 2. Vérifier les processus PM2
echo "2. Vérification des processus PM2..."
if command -v pm2 &> /dev/null; then
    PM2_LIST=$(pm2 list 2>/dev/null || true)
    if echo "$PM2_LIST" | grep -q "online"; then
        echo "Processus PM2 actifs:"
        echo "$PM2_LIST" | grep -E "(name|online|stopped)" || true
        
        # Vérifier si un processus PM2 utilise le port 3500
        PM2_ENV=$(pm2 env 2>/dev/null || true)
        if echo "$PM2_ENV" | grep -q "PORT.*3500\|3500.*PORT"; then
            echo -e "${YELLOW}⚠️  Un processus PM2 est configuré pour utiliser le port 3500${NC}"
        else
            echo -e "${GREEN}✅ Aucun processus PM2 n'utilise le port 3500${NC}"
        fi
    else
        echo -e "${GREEN}✅ Aucun processus PM2 actif${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé${NC}"
fi
echo ""

# 3. Tester la liaison (bind) sur le port
echo "2. Test de liaison sur le port $PORT..."
if command -v nc &> /dev/null || command -v netcat &> /dev/null; then
    # Test avec netcat
    (sleep 1 && echo "quit") | nc -l $PORT &
    NC_PID=$!
    sleep 1
    
    if kill -0 $NC_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Port $PORT peut être lié (bind)${NC}"
        kill $NC_PID 2>/dev/null || true
        wait $NC_PID 2>/dev/null || true
    else
        echo -e "${RED}❌ Impossible de lier le port $PORT${NC}"
    fi
else
    # Test avec Node.js si disponible
    if command -v node &> /dev/null; then
        node -e "
            const net = require('net');
            const server = net.createServer();
            server.listen($PORT, '0.0.0.0', () => {
                console.log('✅ Port $PORT est disponible');
                server.close();
            });
            server.on('error', (err) => {
                console.log('❌ Erreur:', err.message);
                process.exit(1);
            });
        " 2>/dev/null && echo -e "${GREEN}✅ Port $PORT est disponible (test Node.js)${NC}" || echo -e "${RED}❌ Port $PORT n'est pas disponible${NC}"
    else
        echo -e "${YELLOW}⚠️ Ni netcat ni Node.js disponibles pour le test de liaison${NC}"
    fi
fi
echo ""

# 3. Vérifier les règles firewall
echo "3. Vérification du firewall..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo "UFW est actif"
        ufw status | grep $PORT || echo "Port $PORT non explicitement configuré dans UFW"
    else
        echo -e "${YELLOW}⚠️ UFW est inactif${NC}"
    fi
elif command -v iptables &> /dev/null; then
    if iptables -L -n | grep -q $PORT; then
        echo "Règles iptables trouvées pour le port $PORT"
        iptables -L -n | grep $PORT
    else
        echo -e "${YELLOW}⚠️ Aucune règle iptables spécifique pour le port $PORT${NC}"
    fi
else
    echo "Aucun firewall détecté (UFW/iptables)"
fi
echo ""

# 4. Vérifier SELinux (si applicable)
if command -v getenforce &> /dev/null; then
    echo "4. Vérification SELinux..."
    getenforce
    if [ "$(getenforce)" == "Enforcing" ]; then
        echo -e "${YELLOW}⚠️ SELinux est en mode enforcing, peut bloquer les connexions${NC}"
    fi
    echo ""
fi

# 5. Résumé
echo "=========================================="
echo "RÉSUMÉ"
echo "=========================================="

if check_port_in_use; then
    echo -e "${RED}❌ Port $PORT est OCCUPÉ${NC}"
    echo "Action requise: Arrêter le processus utilisant ce port ou choisir un autre port"
    exit 1
else
    echo -e "${GREEN}✅ Port $PORT est LIBRE et disponible${NC}"
    echo ""
    echo "Vous pouvez utiliser ce port dans votre fichier .env:"
    echo "  PORT=3500"
    exit 0
fi
