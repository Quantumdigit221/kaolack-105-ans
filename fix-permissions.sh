#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION DES PERMISSIONS VPS
# =========================================

set -e

echo "🔧 CORRECTION DES PERMISSIONS - KAOLACK 105 ANS"
echo "=============================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"

echo "📁 Correction des permissions du répertoire..."

# Arrêter les services temporaires
echo "⏸️ Arrêt temporaire des services..."
pm2 stop kaolack-backend || true

# Corriger les permissions
echo "🔑 Application des permissions..."
chown -R www-data:www-data $DEPLOY_DIR
chmod -R 755 $DEPLOY_DIR

# Permissions spécifiques pour les répertoires critiques
echo "📂 Permissions des répertoires critiques..."
find $DEPLOY_DIR -type d -exec chmod 755 {} \;
find $DEPLOY_DIR -type f -exec chmod 644 {} \;

# Permissions pour les scripts
find $DEPLOY_DIR -name "*.sh" -exec chmod +x {} \;
find $DEPLOY_DIR -name "*.js" -exec chmod 644 {} \;

# Permissions pour node_modules (cas particulier)
if [ -d "$DEPLOY_DIR/node_modules" ]; then
    chown -R www-data:www-data $DEPLOY_DIR/node_modules
    chmod -R 755 $DEPLOY_DIR/node_modules
fi

if [ -d "$DEPLOY_DIR/backend/node_modules" ]; then
    chown -R www-data:www-data $DEPLOY_DIR/backend/node_modules
    chmod -R 755 $DEPLOY_DIR/backend/node_modules
fi

# Nettoyer le répertoire dist s'il existe
echo "🧹 Nettoyage du répertoire dist..."
if [ -d "$DEPLOY_DIR/dist" ]; then
    rm -rf $DEPLOY_DIR/dist
    echo "✅ Répertoire dist supprimé"
fi

# Recréer le répertoire dist avec les bonnes permissions
echo "📁 Création du répertoire dist..."
mkdir -p $DEPLOY_DIR/dist
chown www-data:www-data $DEPLOY_DIR/dist
chmod 755 $DEPLOY_DIR/dist

echo "✅ Permissions corrigées"

# Relancer le build
echo "🏗️ Relancement du build..."
cd $DEPLOY_DIR
sudo -u www-data npm run build

echo "🔄 Redémarrage des services..."
cd $DEPLOY_DIR/backend
pm2 start kaolack-backend || pm2 start server.js --name "kaolack-backend"

echo "✅ Vérification..."
sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🎉 CORRECTION TERMINÉE AVEC SUCCÈS !"
echo "===================================="
