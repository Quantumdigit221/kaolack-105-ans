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
FRONTEND_PORT="80"
DOMAIN="portail.kaolackcommune.sn"
REPO_URL="https://github.com/Quantumdigit221/kaolack-105-ans.git"
BRANCH="main"

# Fonctions de logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier si on est root ou sudo
    if [ "$EUID" -ne 0 ]; then 
        log_error "Ce script doit être exécuté avec sudo"
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
    fi
    log_success "Node.js $(node --version) trouvé"
    
    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        log_warn "PM2 non trouvé. Installation..."
        npm install -g pm2
    fi
    log_success "PM2 trouvé"
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
    fi
    log_success "Git trouvé"
}

# Créer une sauvegarde
create_backup() {
    log_info "Création d'une sauvegarde..."
    
    mkdir -p $BACKUP_DIR
    
    # Sauvegarder la base de données
    if command -v mysql &> /dev/null; then
        mysqldump --single-transaction --routines --triggers kaolack_stories > $BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql
        log_success "Base de données sauvegardée"
    fi
    
    # Sauvegarder les fichiers
    if [ -d "$DEPLOY_DIR" ]; then
        tar -czf $BACKUP_DIR/files_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C $DEPLOY_DIR .
        log_success "Fichiers sauvegardés"
    fi
}

# Mettre à jour le code source
update_code() {
    log_info "Mise à jour du code source..."
    
    if [ ! -d "$DEPLOY_DIR" ]; then
        log_info "Clonage initial du repository..."
        git clone $REPO_URL $DEPLOY_DIR
    else
        cd $DEPLOY_DIR
        log_info "Pull des dernières modifications..."
        git fetch origin
        git checkout $BRANCH
        git pull origin $BRANCH
    fi
    
    cd $DEPLOY_DIR
    log_success "Code source mis à jour"
}

# Mettre à jour les dépendances backend
update_backend() {
    log_info "Mise à jour des dépendances backend..."
    
    cd $DEPLOY_DIR/backend
    npm ci --production
    log_success "Dépendances backend mises à jour"
}

# Mettre à jour le frontend
update_frontend() {
    log_info "Mise à jour du frontend..."
    
    cd $DEPLOY_DIR
    npm ci
    npm run build
    log_success "Frontend buildé avec succès"
}

# Redémarrer les services
restart_services() {
    log_info "Redémarrage des services..."
    
    # Redémarrer le backend avec PM2
    cd $DEPLOY_DIR/backend
    pm2 restart kaolack-backend || pm2 start server.js --name "kaolack-backend"
    
    # Redémarrer Nginx
    systemctl reload nginx || systemctl restart nginx
    
    log_success "Services redémarrés"
}

# Vérifier le déploiement
verify_deployment() {
    log_info "Vérification du déploiement..."
    
    # Vérifier si le backend répond
    sleep 5
    if curl -f http://localhost:$BACKUP_PORT/api/health &> /dev/null; then
        log_success "Backend répond correctement"
    else
        log_warn "Backend ne répond pas (vérification manuelle requise)"
    fi
    
    # Vérifier si le frontend répond
    if curl -f http://localhost:$FRONTEND_PORT &> /dev/null; then
        log_success "Frontend répond correctement"
    else
        log_warn "Frontend ne répond pas (vérification manuelle requise)"
    fi
}

# Nettoyer
cleanup() {
    log_info "Nettoyage..."
    
    # Supprimer les anciennes sauvegardes (garder les 5 dernières)
    cd $BACKUP_DIR
    ls -t *.sql 2>/dev/null | tail -n +6 | xargs -r rm
    ls -t *.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    
    log_success "Nettoyage terminé"
}

# Afficher le statut final
show_status() {
    echo ""
    echo "=================================="
    echo "🎉 MISE À JOUR TERMINÉE"
    echo "=================================="
    echo ""
    echo "📊 Services actifs :"
    echo "  • Backend: http://localhost:$BACKUP_PORT"
    echo "  • Frontend: http://$DOMAIN"
    echo ""
    echo "🔧 Commandes utiles :"
    echo "  • Voir les logs PM2: pm2 logs kaolack-backend"
    echo "  • Voir le statut: pm2 status"
    echo "  • Redémarrer: pm2 restart kaolack-backend"
    echo ""
    echo "📁 Répertoire: $DEPLOY_DIR"
    echo "📦 Sauvegardes: $BACKUP_DIR"
    echo ""
}

# Fonction principale
main() {
    echo "=================================="
    echo "🚀 MISE À JOUR VPS - KAOLACK 105 ANS"
    echo "=================================="
    echo ""
    
    check_prerequisites
    create_backup
    update_code
    update_backend
    update_frontend
    restart_services
    verify_deployment
    cleanup
    show_status
}

# Exécuter la fonction principale
main "$@"
