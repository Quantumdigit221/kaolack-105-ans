#!/bin/bash

echo "🚀 Déploiement des corrections d'images pour le VPS..."

# Variables VPS
VPS_USER="ubuntu"
VPS_HOST="portail.kaolackcommune.sn"
VPS_PATH="/var/www/kaolack"

echo "📦 1. Pull des dernières modifications..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && git pull origin fix/backend-errors"

echo "🔄 2. Redémarrage du backend..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && pm2 restart kaolack-backend"

echo "🏗️ 3. Build du frontend..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npm run build"

echo "✅ Déploiement terminé !"
echo ""
echo "📊 Vérifications :"
echo "- Les images slides devraient maintenant s'afficher correctement"
echo "- L'icône apple-touch-icon.png est disponible"
echo "- Les URLs ont été corrigées dans la base de données"
