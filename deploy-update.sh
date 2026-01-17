#!/bin/bash

# ==========================================
# SCRIPT DE MISE À JOUR VPS - KAOLACK 105 ANS
# ==========================================

echo "🚀 DÉMARRAGE DE LA MISE À JOUR DU VPS..."

# Variables
VPS_USER="ubuntu"
VPS_IP="51.68.70.83"  # IP VPS configurée
VPS_PATH="/var/www/kaolack"
BACKUP_PATH="/var/backups/kaolack"

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Sauvegarde du VPS
echo ""
log_info "📦 ÉTAPE 1: SAUVEGARDE DU VPS"

ssh $VPS_USER@$VPS_IP << 'EOF'
    echo "📦 Création de la sauvegarde..."
    
    # Créer le répertoire de sauvegarde s'il n'existe pas
    mkdir -p $BACKUP_PATH
    
    # Sauvegarde de la base de données
    echo "📊 Sauvegarde de la base de données..."
    mysqldump -u root -p kaolack_stories > $BACKUP_PATH/db_backup_$(date +%Y%m%d_%H%M%S).sql
    
    # Sauvegarde des fichiers
    echo "📁 Sauvegarde des fichiers..."
    tar -czf $BACKUP_PATH/files_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www kaolack-105-ans
    
    echo "✅ Sauvegarde terminée"
EOF

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors de la sauvegarde"
    exit 1
fi

# 2. Build du frontend
echo ""
log_info "🔨 ÉTAPE 2: BUILD DU FRONTEND"

echo "📦 Installation des dépendances frontend..."
npm install

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors de l'installation des dépendances frontend"
    exit 1
fi

echo "🏗️ Build du frontend en production..."
npm run build:production

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors du build frontend"
    exit 1
fi

# 3. Build du backend
echo ""
log_info "🔧 ÉTAPE 3: PRÉPARATION DU BACKEND"

cd backend

echo "📦 Installation des dépendances backend..."
npm install --production

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors de l'installation des dépendances backend"
    exit 1
fi

cd ..

# 4. Transfert des fichiers vers le VPS
echo ""
log_info "📤 ÉTAPE 4: TRANSFERT DES FICHIERS VERS LE VPS"

echo "📁 Transfert du frontend build..."
scp -r dist/* $VPS_USER@$VPS_IP:$VPS_PATH/frontend/

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors du transfert du frontend"
    exit 1
fi

echo "🔧 Transfert du backend..."
scp -r backend/* $VPS_USER@$VPS_IP:$VPS_PATH/backend/

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors du transfert du backend"
    exit 1
fi

# 5. Configuration et redémarrage des services
echo ""
log_info "⚙️ ÉTAPE 5: CONFIGURATION ET REDÉMARRAGE"

ssh $VPS_USER@$VPS_IP << 'EOF'
    echo "📁 Mise à jour des permissions..."
    chown -R www-data:www-data $VPS_PATH
    chmod -R 755 $VPS_PATH
    
    echo "🔧 Redémarrage du backend..."
    cd $VPS_PATH/backend
    
    # Arrêter les processus existants
    pkill -f "node server.js"
    sleep 2
    
    # Démarrer le nouveau backend
    npm install --production
    nohup node server.js > backend.log 2>&1 &
    
    echo "🌐 Redémarrage de Nginx..."
    systemctl reload nginx
    
    echo "🔍 Vérification des services..."
    sleep 3
    
    # Vérifier si le backend fonctionne
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend fonctionnel"
    else
        echo "❌ Backend ne répond pas"
        exit 1
    fi
    
    echo "✅ Services redémarrés avec succès"
EOF

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors du redémarrage des services"
    exit 1
fi

# 6. Nettoyage
echo ""
log_info "🧹 ÉTAPE 6: NETTOYAGE"

echo "🗑️ Nettoyage des fichiers temporaires..."
rm -rf node_modules
cd backend && rm -rf node_modules && cd ..

echo "✅ Nettoyage terminé"

# 7. Vérification finale
echo ""
log_info "🔍 ÉTAPE 7: VÉRIFICATION FINALE"

echo "🌐 Test de connexion à l'API..."
sleep 5

if curl -f http://$VPS_IP:3001/api/health > /dev/null 2>&1; then
    log_info "✅ API accessible"
else
    log_warning "⚠️ API non accessible, vérification manuelle requise"
fi

echo ""
log_info "🎉 MISE À JOUR TERMINÉE AVEC SUCCÈS !"
echo ""
echo "📋 RÉCAPITULATIF:"
echo "   ✅ Frontend buildé et déployé"
echo "   ✅ Backend mis à jour et redémarré"
echo "   ✅ Services configurés"
echo "   ✅ Sauvegarde créée"
echo ""
echo "🌐 Accès à l'application: https://portail.kaolackcommune.sn"
echo "🔧 Accès à l'API: https://portail.kaolackcommune.sn/api"
echo ""
echo "📝 Modifications apportées:"
echo "   • Séparation Actualités vs Publications clarifiée"
echo "   • Nouvelles catégories pour annonces officielles"
echo "   • Correction des erreurs 500"
echo "   • Interface admin optimisée"
echo ""
log_info "✅ IP VPS configurée : 51.68.70.83"
log_info "✅ Domaine configuré : portail.kaolackcommune.sn"
log_warning "🔐 Pensez à exécuter ./ssl-setup.sh pour configurer HTTPS"
