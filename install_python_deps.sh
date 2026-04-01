#!/bin/bash
# Script d'installation des dépendances Python pour Arch Linux
# Usage: sudo ./install_python_deps.sh

set -e

echo "=========================================="
echo "Installation des dépendances Python"
echo "=========================================="
echo ""

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    echo "Usage: sudo ./install_python_deps.sh"
    exit 1
fi

echo "📦 Mise à jour des paquets..."
pacman -Sy --noconfirm

echo ""
echo "📦 Installation de pip et des dépendances Python..."
pacman -S --noconfirm python-pip python-pandas python-numpy python-matplotlib python-requests python-dateutil

echo ""
echo "📦 Installation des paquets supplémentaires avec pip..."
pip install seaborn plotly scikit-learn openpyxl xlrd tqdm --break-system-packages 2>/dev/null || pip install seaborn plotly scikit-learn openpyxl xlrd tqdm

echo ""
echo "✅ Installation terminée !"
echo ""
echo "Paquets installés:"
echo "  - pandas (traitement de données)"
echo "  - numpy (calcul numérique)"
echo "  - matplotlib, seaborn, plotly (visualisation)"
echo "  - scikit-learn (machine learning)"
echo "  - openpyxl, xlrd (fichiers Excel)"
echo "  - requests (HTTP)"
echo "  - tqdm (barres de progression)"
