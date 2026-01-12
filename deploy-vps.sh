#!/bin/bash

# =========================================
# SCRIPT DE DÉPLOIEMENT VPS - KAOLACK 105 ANS
# Version optimisée avec toutes les corrections
# =========================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
PROJECT_NAME="kaolack-105-ans"
DEPLOY_DIR="/var/www/kaolack"
BACKEND_PORT="3003"
FRONTEND_PORT="80"
DOMAIN="portail.kaolackcommune.sn"
REPO_URL="https://github.com/Quantumdigit221/kaolack-105-ans.git"
BRANCH="fix/backend-errors"

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
        log_warn "Node.js non trouvé. Installation..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    log_success "Node.js $(node --version) installé"
    
    # Vérifier MySQL
    if ! command -v mysql &> /dev/null; then
        log_warn "MySQL non trouvé. Installation..."
        apt-get update
        apt-get install -y mysql-server
    fi
    log_success "MySQL installé"
    
    # Vérifier Nginx
    if ! command -v nginx &> /dev/null; then
        log_warn "Nginx non trouvé. Installation..."
        apt-get install -y nginx
    fi
    log_success "Nginx installé"
    
    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        log_warn "PM2 non trouvé. Installation..."
        npm install -g pm2
    fi
    log_success "PM2 installé"
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        apt-get install -y git
    fi
    log_success "Git installé"
}

# Configuration des répertoires
setup_directories() {
    log_info "Configuration des répertoires..."
    mkdir -p $DEPLOY_DIR
    mkdir -p $DEPLOY_DIR/uploads
    mkdir -p $DEPLOY_DIR/logs
    mkdir -p /var/log/pm2
    mkdir -p /var/backups/kaolack
    log_success "Répertoires créés"
}

# Cloner ou mettre à jour le repository
clone_or_update_repo() {
    log_info "Préparation du code source..."
    if [ -d "$DEPLOY_DIR/.git" ]; then
        log_info "Mise à jour du repository existant..."
        cd $DEPLOY_DIR
        git fetch origin
        git checkout $BRANCH || git checkout main
        git pull origin $BRANCH || git pull origin main
    else
        log_info "Clonage du repository..."
        git clone -b $BRANCH $REPO_URL $DEPLOY_DIR || git clone $REPO_URL $DEPLOY_DIR
    fi
    log_success "Code source préparé"
}

# Configuration de la base de données
setup_database() {
    log_info "Configuration de la base de données..."
    
    # Créer la base de données et l'utilisateur
    mysql << EOF || log_warn "Base de données peut-être déjà existante"
CREATE DATABASE IF NOT EXISTS kaolack_stories CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'kaolack_user'@'localhost' IDENTIFIED BY 'Kaolack2024Secure!';
GRANT ALL PRIVILEGES ON kaolack_stories.* TO 'kaolack_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    log_success "Base de données configurée"
}

# Configuration des variables d'environnement
setup_environment() {
    log_info "Configuration des variables d'environnement..."
    cd $DEPLOY_DIR
    
    if [ ! -f "$DEPLOY_DIR/.env" ]; then
        log_info "Création du fichier .env..."
        cat > $DEPLOY_DIR/.env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=kaolack_user
DB_PASSWORD=Kaolack2024Secure!
DB_NAME=kaolack_stories
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_change_me_$(openssl rand -hex 32)
JWT_EXPIRY=7d
SESSION_SECRET=your_super_secure_session_secret_change_me_$(openssl rand -hex 32)

# CORS
CORS_ORIGIN=https://$DOMAIN

# Upload
UPLOAD_DIR=$DEPLOY_DIR/uploads

# Frontend
VITE_API_URL=https://$DOMAIN/api

# Google Gemini (optionnel)
GOOGLE_GEMINI_API_KEY=
EOF
        log_warn "⚠️  Fichier .env créé avec des valeurs par défaut. Veuillez le modifier !"
    else
        log_success "Fichier .env existe déjà"
    fi
    
    # Configuration backend .env
    if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
        cp $DEPLOY_DIR/.env $DEPLOY_DIR/backend/.env
    fi
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    cd $DEPLOY_DIR
    
    # Frontend
    log_info "Installation des dépendances frontend..."
    npm install --production
    
    # Backend
    log_info "Installation des dépendances backend..."
    cd $DEPLOY_DIR/backend
    npm install --production
    cd $DEPLOY_DIR
    
    log_success "Dépendances installées"
}

# Build du frontend
build_frontend() {
    log_info "Build du frontend..."
    cd $DEPLOY_DIR
    
    # Vérifier que vite.config.ts existe
    if [ ! -f "vite.config.ts" ]; then
        log_warn "vite.config.ts manquant, création..."
        cat > vite.config.ts << 'EOL'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist"
  }
});
EOL
    fi
    
    # Build
    npm run build
    
    if [ -d "$DEPLOY_DIR/dist" ]; then
        log_success "Frontend buildé avec succès"
    else
        log_error "Échec du build frontend"
    fi
}

# Exécution des migrations
run_migrations() {
    log_info "Exécution des migrations de base de données..."
    cd $DEPLOY_DIR/backend
    
    if [ -d "migrations" ]; then
        npx sequelize-cli db:migrate || log_warn "Migrations peut-être déjà exécutées"
        log_success "Migrations exécutées"
    else
        log_warn "Aucune migration trouvée"
    fi
}

# Configuration PM2
setup_pm2() {
    log_info "Configuration PM2..."
    cd $DEPLOY_DIR
    
    # Créer le fichier ecosystem.config.cjs s'il n'existe pas
    if [ ! -f "ecosystem.config.cjs" ]; then
        cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'kaolack-backend',
    script: './backend/server.js',
    cwd: '$DEPLOY_DIR',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $BACKEND_PORT
    },
    error_file: '/var/log/pm2/kaolack-backend-error.log',
    out_file: '/var/log/pm2/kaolack-backend-out.log',
    log_file: '/var/log/pm2/kaolack-backend-combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
EOF
    fi
    
    # Démarrer ou redémarrer avec PM2
    pm2 delete kaolack-backend 2>/dev/null || true
    pm2 start ecosystem.config.cjs
    pm2 save
    pm2 startup systemd -u root --hp /root || log_warn "PM2 startup déjà configuré"
    
    log_success "PM2 configuré et application démarrée"
}

# Configuration Nginx
setup_nginx() {
    log_info "Configuration Nginx..."
    
    # Créer la configuration Nginx
    cat > /etc/nginx/sites-available/kaolack << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    root $DEPLOY_DIR/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/kaolack_access.log;
    error_log /var/log/nginx/kaolack_error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API Backend proxy
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    # Upload files
    location /uploads/ {
        alias $DEPLOY_DIR/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Static files with long expiry
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router - SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Activer le site
    ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
    
    # Supprimer la configuration par défaut
    rm -f /etc/nginx/sites-enabled/default
    
    # Tester la configuration
    nginx -t || log_error "Erreur dans la configuration Nginx"
    
    # Recharger Nginx
    systemctl reload nginx
    
    log_success "Nginx configuré"
}

# Configuration du firewall
setup_firewall() {
    log_info "Configuration du firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable || log_warn "Firewall peut-être déjà configuré"
    log_success "Firewall configuré"
}

# Configuration SSL (Let's Encrypt)
setup_ssl() {
    log_info "Configuration SSL avec Let's Encrypt..."
    
    if ! command -v certbot &> /dev/null; then
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    log_warn "Pour configurer SSL, exécutez: certbot --nginx -d $DOMAIN"
}

# Tests de déploiement
test_deployment() {
    log_info "Tests de déploiement..."
    
    # Test backend
    sleep 3
    if curl -f http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        log_success "Backend opérationnel"
    else
        log_warn "Backend peut ne pas être encore prêt"
    fi
    
    # Test frontend
    if [ -f "$DEPLOY_DIR/dist/index.html" ]; then
        log_success "Frontend buildé correctement"
    else
        log_error "Frontend non trouvé"
    fi
}

# Affichage du résumé
show_summary() {
    echo ""
    echo -e "${GREEN}=================================================================="
    echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
    echo "==================================================================${NC}"
    echo ""
    echo -e "${BLUE}📋 Informations de déploiement:${NC}"
    echo "   • Frontend : http://$DOMAIN"
    echo "   • API Backend : http://$DOMAIN/api"
    echo "   • Répertoire : $DEPLOY_DIR"
    echo ""
    echo -e "${YELLOW}🔧 Commandes utiles:${NC}"
    echo "   • Logs backend : pm2 logs kaolack-backend"
    echo "   • Redémarrer backend : pm2 restart kaolack-backend"
    echo "   • Status PM2 : pm2 status"
    echo "   • Recharger Nginx : systemctl reload nginx"
    echo ""
    echo -e "${BLUE}⚠️  Actions requises:${NC}"
    echo "   1. Modifier les mots de passe dans $DEPLOY_DIR/.env"
    echo "   2. Configurer SSL : certbot --nginx -d $DOMAIN"
    echo "   3. Vérifier que le domaine $DOMAIN pointe vers ce serveur"
    echo ""
}

# Fonction principale
main() {
    clear
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "    DÉPLOIEMENT VPS - KAOLACK 105 ANS"
    echo "=================================================================="
    echo -e "${NC}"
    echo ""
    
    check_prerequisites && echo ""
    setup_directories && echo ""
    clone_or_update_repo && echo ""
    setup_database && echo ""
    setup_environment && echo ""
    install_dependencies && echo ""
    build_frontend && echo ""
    run_migrations && echo ""
    setup_pm2 && echo ""
    setup_nginx && echo ""
    setup_firewall && echo ""
    setup_ssl && echo ""
    test_deployment && echo ""
    show_summary
}

# Exécution
main
