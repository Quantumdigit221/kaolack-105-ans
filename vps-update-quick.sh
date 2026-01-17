#!/bin/bash

# =========================================
# SCRIPT DE MISE À JOUR RAPIDE VPS
# À exécuter directement sur le VPS
# =========================================

set -e

# Variables
DEPLOY_DIR="/var/www/kaolack"
REPO_URL="https://github.com/Quantumdigit221/kaolack-105-ans.git"
BRANCH="main"

echo "🚀 MISE À JOUR RAPIDE VPS - KAOLACK 105 ANS"
echo "============================================"

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

# 1. Sauvegarde rapide
echo "📦 Sauvegarde de l'état actuel..."
mkdir -p /var/backups/kaolack
if [ -d "$DEPLOY_DIR" ]; then
    tar -czf /var/backups/kaolack/quick_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C $DEPLOY_DIR .
fi

# 2. Mise à jour du code
echo "📥 Mise à jour du code source..."
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 Clonage initial..."
    git clone -b $BRANCH $REPO_URL $DEPLOY_DIR
else
    cd $DEPLOY_DIR
    echo "🔄 Pull des dernières modifications..."
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
fi

# 3. Installation des dépendances
echo "📦 Installation des dépendances..."
cd $DEPLOY_DIR

# Backend
echo "🔧 Dépendances backend..."
cd backend
npm ci --production

# Frontend
echo "🏗️ Build du frontend..."
cd ..
npm ci
npm run build

# 4. Redémarrage des services
echo "🔄 Redémarrage des services..."

# Backend avec PM2
cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend || pm2 start server.js --name "kaolack-backend"

# Nginx
systemctl reload nginx

# 5. Vérification
echo "✅ Vérification..."
sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🎉 MISE À JOUR TERMINÉE !"
echo "=========================="
echo "🌐 Site : https://portail.kaolackcommune.sn"
echo "🔧 API : https://portail.kaolackcommune.sn/api"
echo ""
echo "🔧 Commandes utiles :"
echo "  • Logs : pm2 logs kaolack-backend"
echo "  • Restart : pm2 restart kaolack-backend"
echo "  • Status : pm2 status"
