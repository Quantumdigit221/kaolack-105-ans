#!/bin/bash

# ==========================================
# SCRIPT DE DÉPLOIEMENT GIT - KAOLACK 105 ANS
# ==========================================

echo "🚀 DÉPLOIEMENT GIT VERS LE VPS..."

# Variables
VPS_USER="root"
VPS_IP="51.68.70.83"
VPS_PATH="/var/www/kaolack"
REPO_NAME="kaolack-105-ans"
BRANCH="main"

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Initialisation Git si nécessaire
if [ ! -d ".git" ]; then
    log_info "📦 Initialisation du dépôt Git..."
    git init
    git add .
    git commit -m "Initial commit - Kaolack 105 Ans"
    
    log_info "🌐 Ajout du remote origin..."
    git remote add origin ssh://$VPS_USER@$VPS_IP/$VPS_PATH.git
else
    log_info "📦 Dépôt Git déjà initialisé"
fi

# 2. Configuration du VPS pour Git
log_info "🔧 Configuration du VPS pour Git..."

ssh $VPS_USER@$VPS_IP << 'EOF'
    # Installation de Git si nécessaire
    if ! command -v git &> /dev/null; then
        echo "📦 Installation de Git..."
        apt update && apt install -y git
    fi
    
    # Création du dépôt Git nu
    mkdir -p /var/www/kaolack.git
    cd /var/www/kaolack.git
    if [ ! -d "hooks" ]; then
        echo "📦 Initialisation du dépôt Git nu..."
        git init --bare
    fi
    
    # Configuration du hook post-receive
    cat > hooks/post-receive << 'HOOK'
#!/bin/bash
echo "🚀 Déploiement automatique en cours..."

# Variables
REPO_PATH="/var/www/kaolack.git"
DEPLOY_PATH="/var/www/kaolack"
BACKUP_PATH="/var/backups/kaolack"

# Création du backup
echo "📦 Création de la sauvegarde..."
mkdir -p $BACKUP_PATH
DATE=$(date +%Y%m%d_%H%M%S)

# Backup base de données
mysqldump -u kaolack_user -p'kaolack_password_2024' kaolack_stories > $BACKUP_PATH/db_backup_$DATE.sql

# Backup fichiers
if [ -d "$DEPLOY_PATH" ]; then
    tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz -C /var/www kaolack
fi

# Déploiement
echo "📁 Déploiement des fichiers..."
GIT_WORK_TREE=$DEPLOY_PATH git checkout -f

# Installation des dépendances
echo "📦 Installation des dépendances backend..."
cd $DEPLOY_PATH/backend
npm install --production

# Build du frontend
echo "🔨 Build du frontend..."
cd $DEPLOY_PATH
npm install
npm run build:production

# Configuration des permissions
echo "🔐 Configuration des permissions..."
chown -R www-data:www-data $DEPLOY_PATH
chmod -R 755 $DEPLOY_PATH

# Redémarrage des services
echo "🔄 Redémarrage des services..."
cd $DEPLOY_PATH/backend
pkill -f "node server.js"
sleep 2
nohup node server.js > backend.log 2>&1 &

# Redémarrage Nginx
systemctl reload nginx

echo "✅ Déploiement terminé avec succès !"
HOOK

    chmod +x hooks/post-receive
    
    echo "✅ Configuration Git terminée"
EOF

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors de la configuration Git du VPS"
    exit 1
fi

# 3. Commit des modifications locales
log_info "📦 Commit des modifications locales..."
git add .
git commit -m "Mise à jour - Séparation Actualités/Publications et corrections"

# 4. Push vers le VPS
log_info "📤 Push vers le VPS..."
git push origin main

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors du push vers le VPS"
    exit 1
fi

echo ""
log_info "🎉 DÉPLOIEMENT GIT TERMINÉ AVEC SUCCÈS !"
echo ""
echo "📋 RÉCAPITULATIF:"
echo "   ✅ Dépôt Git configuré"
echo "   ✅ Hook post-receive configuré"
echo "   ✅ Déploiement automatique activé"
echo ""
echo "🔄 Pour les prochains déploiements:"
echo "   git add ."
echo "   git commit -m 'Votre message'"
echo "   git push origin main"
echo ""
echo "🌐 Accès à l'application: https://portail.kaolackcommune.sn"
echo "🔧 Accès à l'API: https://portail.kaolackcommune.sn/api"
echo ""
log_info "✅ Le déploiement automatique est maintenant configuré !"
