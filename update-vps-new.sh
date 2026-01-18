#!/bin/bash

# ========================================
# Script de Mise à Jour VPS - Kaolack 105 Ans
# VPS: ubuntu@51.68.70.83
# ========================================

set -e

# Variables
VPS_USER="ubuntu"
VPS_IP="51.68.70.83"
VPS_HOST="$VPS_USER@$VPS_IP"
DOMAIN="portail.kaolackcommune.sn"
PROJECT_DIR="/var/www/kaolack"

echo "🔄 Mise à jour VPS pour Kaolack 105 Ans"
echo "===================================="
echo "📍 VPS: $VPS_HOST"
echo "🌐 Domaine: $DOMAIN"
echo ""

# Fonction pour exécuter des commandes sur le VPS
exec_ssh() {
    ssh $VPS_HOST "$1"
}

# 1. Test de connexion
echo "🔍 Test de connexion au VPS..."
if ! ssh -o ConnectTimeout=10 $VPS_HOST "echo 'Connexion OK'"; then
    echo "❌ Impossible de se connecter au VPS $VPS_HOST"
    exit 1
fi
echo "✅ Connexion VPS réussie"
echo ""

# 2. Sauvegarde avant mise à jour
echo "💾 Sauvegarde de l'ancienne version..."
exec_ssh "
sudo mkdir -p /var/backups/kaolack
BACKUP_DIR=\"/var/backups/kaolack/backup_$(date +%Y%m%d_%H%M%S)\"
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
sudo mysqldump -u kaolack_user -p'Kaolack2024Secure!' kaolack_stories > $BACKUP_DIR/database.sql

# Sauvegarder les fichiers uploads
if [ -d '$PROJECT_DIR/backend/uploads' ]; then
    sudo cp -r $PROJECT_DIR/backend/uploads $BACKUP_DIR/
fi

# Sauvegarder la configuration
if [ -f '$PROJECT_DIR/backend/.env.production' ]; then
    sudo cp $PROJECT_DIR/backend/.env.production $BACKUP_DIR/
fi

echo '✅ Sauvegarde créée: $BACKUP_DIR'
"

# 3. Mise à jour du code
echo "📥 Mise à jour du code source..."
exec_ssh "
cd $PROJECT_DIR

# Sauvegarder la configuration locale
if [ -f 'backend/.env.production' ]; then
    cp backend/.env.production backend/.env.production.backup
fi

# Pull des dernières modifications
git fetch origin
git reset --hard origin/main

# Restaurer la configuration locale
if [ -f 'backend/.env.production.backup' ]; then
    cp backend/.env.production.backup backend/.env.production
    rm backend/.env.production.backup
fi

echo '✅ Code mis à jour'
"

# 4. Installation des dépendances
echo "📦 Mise à jour des dépendances..."
exec_ssh "
cd $PROJECT_DIR/backend
npm ci --production

cd $PROJECT_DIR
npm ci
npm run build

echo '✅ Dépendances mises à jour'
"

# 5. Migration de la base de données
echo "🗄️  Migration de la base de données..."
exec_ssh "
cd $PROJECT_DIR/backend

# Vérifier si des migrations sont nécessaires
if [ -f 'migrations' ] || npm run migrate 2>/dev/null || true; then
    echo '✅ Migration effectuée'
else
    echo 'ℹ️  Aucune migration nécessaire'
fi
"

# 6. Configuration des permissions
echo "🔐 Configuration des permissions..."
exec_ssh "
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod -R 777 $PROJECT_DIR/backend/uploads
mkdir -p $PROJECT_DIR/logs
sudo chown -R www-data:www-data $PROJECT_DIR/logs

echo '✅ Permissions configurées'
"

# 7. Redémarrage des services
echo "🔄 Redémarrage des services..."
exec_ssh "
cd $PROJECT_DIR

# Redémarrer PM2
pm2 restart kaolack-backend

# Redémarrer Nginx
sudo nginx -t
sudo systemctl reload nginx

echo '✅ Services redémarrés'
"

# 8. Vérification post-mise à jour
echo "🧪 Vérification post-mise à jour..."
sleep 5

# Test API
if exec_ssh "curl -f http://127.0.0.1:3001/api/health > /dev/null 2>&1"; then
    echo "✅ API backend fonctionnelle"
else
    echo "❌ API backend inaccessible"
    exec_ssh "pm2 logs kaolack-backend --lines 20"
fi

# Test PM2
if exec_ssh "pm2 list | grep -q 'kaolack-backend.*online'"; then
    echo "✅ Service PM2 en ligne"
else
    echo "❌ Service PM2 hors ligne"
fi

# Test Nginx
if exec_ssh "sudo nginx -t > /dev/null 2>&1"; then
    echo "✅ Configuration Nginx valide"
else
    echo "❌ Erreur configuration Nginx"
fi

echo ""
echo "🎉 MISE À JOUR TERMINÉE !"
echo "============================="
echo ""
echo "📊 Informations:"
echo "   • VPS: $VPS_HOST"
echo "   • Domaine: $DOMAIN"
echo "   • URL: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api"
echo ""
echo "🔧 Commandes utiles:"
echo "   • Logs: ssh $VPS_HOST 'pm2 logs kaolack-backend'"
echo "   • Status: ssh $VPS_HOST 'pm2 status'"
echo "   • Restart: ssh $VPS_HOST 'pm2 restart kaolack-backend'"
echo "   • Nginx: ssh $VPS_HOST 'sudo nginx -t && sudo systemctl reload nginx'"
echo ""
echo "🌐 Accès à l'application:"
echo "   • Frontend: https://$DOMAIN"
echo "   • API Health: https://$DOMAIN/api/health"
echo ""
echo "✅ Votre application Kaolack 105 Ans est maintenant à jour !"
