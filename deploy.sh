#!/bin/bash#!/bin/bash#!/bin/bash



# ========================================

# 🚀 Automated VPS Deployment Script

# ========================================# ========================================# Script de déploiement automatique

# Deployment for: portail.kaolackcommune.sn

# Infrastructure: Docker + Docker Compose# 🚀 Script de Déploiement Ubuntu VPSecho "🚀 Déploiement en cours..."

# OS: Ubuntu 22.04 LTS / 24.04 LTS

# ========================================# ========================================



set -e# Utilisation: ./deploy.sh# 1. Construction du frontend



# Color outputecho "📦 Construction du frontend..."

RED='\033[0;31m'

GREEN='\033[0;32m'set -enpm run build

YELLOW='\033[1;33m'

BLUE='\033[0;34m'

NC='\033[0m' # No Color

# Couleurs# 2. Création du dossier de déploiement

# Configuration

DOMAIN="portail.kaolackcommune.sn"RED='\033[0;31m'mkdir -p deploy/frontend

API_DOMAIN="api.kaolackcommune.sn"

APP_DIR="/var/www/kaolack"GREEN='\033[0;32m'mkdir -p deploy/backend

DOCKER_COMPOSE_VERSION="2.0"

YELLOW='\033[1;33m'

# Functions

log_info() {BLUE='\033[0;34m'# 3. Copie des fichiers frontend (dist)

  echo -e "${BLUE}ℹ️  $1${NC}"

}NC='\033[0m' # No Colorecho "📂 Copie des fichiers frontend..."



log_success() {cp -r dist/* deploy/frontend/

  echo -e "${GREEN}✓ $1${NC}"

}# Configurationcp .htaccess deploy/frontend/



log_warn() {APP_DIR="/var/www/kaolack"

  echo -e "${YELLOW}⚠️  $1${NC}"

}REPO_URL="https://github.com/Quantumdigit221/kaolack-105-ans.git"# 4. Copie des fichiers backend



log_error() {DOMAIN="portail.kaolackcommune.sn"echo "📂 Copie des fichiers backend..."

  echo -e "${RED}✗ $1${NC}"

  exit 1API_DOMAIN="api.portail.kaolackcommune.sn"cp -r backend/* deploy/backend/

}

USER="kaolack"cp backend/.env.production deploy/backend/.env

# Check if running as root

if [[ $EUID -ne 0 ]]; thenGROUP="kaolack"

  log_error "This script must be run as root. Use: sudo ./deploy.sh"

fi# 5. Nettoyage des fichiers de développement



log_info "🚀 Starting VPS Deployment for $DOMAIN"# ====================================echo "🧹 Nettoyage..."



# Step 1: System Update# Fonctions utilitairesrm -f deploy/backend/.env.local

log_info "Step 1/8: Updating system packages..."

apt-get update# ====================================rm -rf deploy/backend/node_modules

apt-get upgrade -y

apt-get install -y curl wget git build-essential

log_success "System updated"

log_info() {echo "✅ Déploiement préparé dans le dossier 'deploy/'"

# Step 2: Install Docker

log_info "Step 2/8: Installing Docker and Docker Compose..."    echo -e "${BLUE}[INFO]${NC} $1"echo "📝 Instructions:"

if ! command -v docker &> /dev/null; then

  curl -fsSL https://get.docker.com -o get-docker.sh}echo "1. Uploadez 'deploy/frontend/' vers public_html/"

  bash get-docker.sh

  usermod -aG docker ${SUDO_USER}echo "2. Uploadez 'deploy/backend/' vers un dossier backend/"

  log_success "Docker installed"

elselog_success() {echo "3. Configurez les variables d'environnement"

  log_warn "Docker already installed"

fi    echo -e "${GREEN}[✓]${NC} $1"echo "4. Installez les dépendances: npm install --production"



if ! command -v docker-compose &> /dev/null; then}echo "5. Exécutez les migrations: npx sequelize-cli db:migrate"

  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

  chmod +x /usr/local/bin/docker-composelog_error() {

  log_success "Docker Compose installed"    echo -e "${RED}[✗]${NC} $1"

else}

  log_warn "Docker Compose already installed"

filog_warning() {

    echo -e "${YELLOW}[!]${NC} $1"

# Step 3: Create application directory}

log_info "Step 3/8: Creating application directory..."

mkdir -p $APP_DIRcheck_root() {

log_success "Directory created: $APP_DIR"    if [[ $EUID -ne 0 ]]; then

        log_error "Ce script doit être exécuté en tant que root (sudo)"

# Step 4: Clone repository        exit 1

log_info "Step 4/8: Cloning repository..."    fi

if [ ! -d "$APP_DIR/.git" ]; then}

  cd /tmp

  git clone https://github.com/Quantumdigit221/kaolack-105-ans.git temp-clone# ====================================

  cp -r temp-clone/* $APP_DIR/# Installation des dépendances

  rm -rf temp-clone# ====================================

  log_success "Repository cloned"

elseinstall_dependencies() {

  log_warn "Repository already exists, skipping clone"    log_info "Installation des dépendances système..."

fi    

    apt-get update -qq

cd $APP_DIR    

    # Docker

# Step 5: Configure environment    if ! command -v docker &> /dev/null; then

log_info "Step 5/8: Configuring environment..."        log_info "Installation de Docker..."

if [ ! -f "$APP_DIR/.env.production" ]; then        curl -fsSL https://get.docker.com -o get-docker.sh

  cp .env.production .env.production.backup        bash get-docker.sh

  log_warn "Please configure .env.production with your values:"        rm get-docker.sh

  log_warn "  - DB_PASSWORD"        usermod -aG docker root

  log_warn "  - JWT_SECRET (generate: openssl rand -base64 32)"        log_success "Docker installé"

  log_warn "  - SESSION_SECRET (generate: openssl rand -base64 32)"    else

  log_warn "  - SMTP settings (optional)"        log_success "Docker déjà installé"

  read -p "Press Enter once you've edited .env.production..."    fi

fi    

log_success "Environment configured"    # Docker Compose

    if ! command -v docker-compose &> /dev/null; then

# Step 6: Install SSL Certificate        log_info "Installation de Docker Compose..."

log_info "Step 6/8: Installing SSL certificates with Certbot..."        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

apt-get install -y certbot python3-certbot-nginx        chmod +x /usr/local/bin/docker-compose

        log_success "Docker Compose installé"

certbot certonly --standalone \    else

    -d $DOMAIN \        log_success "Docker Compose déjà installé"

    -d www.$DOMAIN \    fi

    -d $API_DOMAIN \    

    --email admin@${DOMAIN%.*} \    # Git

    --agree-tos \    if ! command -v git &> /dev/null; then

    --non-interactive \        apt-get install -y git

    --preferred-challenges http || log_warn "Certbot setup completed or already configured"        log_success "Git installé"

    fi

mkdir -p $APP_DIR/ssl    

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then    # Certbot pour SSL

  cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/ssl/cert.pem    if ! command -v certbot &> /dev/null; then

  cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $APP_DIR/ssl/key.pem        apt-get install -y certbot python3-certbot-nginx

  log_success "SSL certificates copied"        log_success "Certbot installé"

fi    fi

    

# Step 7: Build and start Docker containers    # UFW Firewall

log_info "Step 7/8: Building and starting Docker containers..."    if ! command -v ufw &> /dev/null; then

docker-compose build        apt-get install -y ufw

docker-compose up -d        ufw allow 22/tcp

log_success "Containers started"        ufw allow 80/tcp

        ufw allow 443/tcp

# Wait for services to be ready        ufw --force enable

log_info "Waiting for services to be ready..."        log_success "Firewall configuré"

sleep 10    fi

}

# Step 8: Initialize database

log_info "Step 8/8: Initializing database..."# ====================================

if docker-compose exec -T mysql mysql -u root -proot -e "SELECT 1" &> /dev/null; then# Configuration des répertoires

  log_success "Database is ready"# ====================================

else

  log_warn "Database initialization failed, check docker-compose logs"setup_directories() {

fi    log_info "Configuration des répertoires..."

    

# Post-deployment summary    # Créer l'utilisateur

log_success "🎉 Deployment completed successfully!"    if ! id "$USER" &>/dev/null; then

echo ""        useradd -m -s /bin/bash "$USER"

echo "========================================="        log_success "Utilisateur $USER créé"

echo "📋 POST-DEPLOYMENT CHECKLIST"    fi

echo "========================================="    

echo ""    # Créer les répertoires

echo "✅ Services running:"    mkdir -p "$APP_DIR"

docker-compose ps    mkdir -p "$APP_DIR/uploads"

echo ""    mkdir -p "$APP_DIR/ssl"

echo "🌐 Access your application:"    mkdir -p "$APP_DIR/logs"

echo "   Frontend: https://$DOMAIN"    

echo "   API:      https://$API_DOMAIN/api"    # Permissions

echo "   Health:   https://$API_DOMAIN/api/health"    chown -R "$USER:$GROUP" "$APP_DIR"

echo ""    chmod -R 755 "$APP_DIR"

echo "📊 View logs:"    chmod -R 775 "$APP_DIR/uploads"

echo "   All logs:     docker-compose logs -f"    

echo "   Backend only: docker-compose logs -f backend"    log_success "Répertoires créés et configurés"

echo "   MySQL:        docker-compose logs -f mysql"}

echo "   Nginx:        docker-compose logs -f nginx"

echo ""# ====================================

echo "🔄 Useful commands:"# Cloner le repository

echo "   Restart:  docker-compose restart"# ====================================

echo "   Stop:     docker-compose stop"

echo "   Start:    docker-compose start"clone_repo() {

echo "   Rebuild:  docker-compose up -d --build"    log_info "Clonage du repository..."

echo ""    

echo "📁 Application directory: $APP_DIR"    if [ -d "$APP_DIR/.git" ]; then

echo ""        log_info "Mise à jour du repository existant..."

echo "========================================="        cd "$APP_DIR"

echo ""        git pull origin main

log_info "For more information, see DEPLOYMENT_VPS.md"    else

log_info "For troubleshooting, see DEPLOYMENT_VPS.md (Section 7)"        git clone "$REPO_URL" "$APP_DIR"

echo ""        cd "$APP_DIR"

log_success "Deployment ready! 🚀"    fi

    
    log_success "Repository préparé"
}

# ====================================
# Configuration environnement
# ====================================

setup_environment() {
    log_info "Configuration des variables d'environnement..."
    
    if [ ! -f "$APP_DIR/.env.production" ]; then
        log_error "Fichier .env.production introuvable!"
        log_warning "Veuillez copier .env.production avant de continuer"
        exit 1
    fi
    
    # Générer des secrets s'ils ne sont pas définis
    if grep -q "change_me_in_production" "$APP_DIR/.env.production"; then
        log_warning "⚠️  Des valeurs par défaut trouvées dans .env.production"
        log_warning "Veuillez les remplacer avant la production!"
    fi
    
    log_success "Variables d'environnement vérifiées"
}

# ====================================
# Configuration SSL
# ====================================

setup_ssl() {
    log_info "Configuration SSL avec Let's Encrypt..."
    
    if [ ! -f "$APP_DIR/ssl/cert.pem" ]; then
        log_info "Génération de certificat SSL..."
        certbot certonly --standalone \
            -d "$DOMAIN" \
            -d "www.$DOMAIN" \
            -d "$API_DOMAIN" \
            --email admin@kaolack.sn \
            --agree-tos \
            --non-interactive
        
        # Copier les certificats
        cp /etc/letsencrypt/live/"$DOMAIN"/fullchain.pem "$APP_DIR/ssl/cert.pem"
        cp /etc/letsencrypt/live/"$DOMAIN"/privkey.pem "$APP_DIR/ssl/key.pem"
        
        chown -R "$USER:$GROUP" "$APP_DIR/ssl"
        chmod 600 "$APP_DIR/ssl"/*.pem
    fi
    
    log_success "SSL configuré"
}

# ====================================
# Configuration Cron pour renouvellement SSL
# ====================================

setup_ssl_renewal() {
    log_info "Configuration du renouvellement automatique SSL..."
    
    # Créer un script de renouvellement
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/kaolackcommune.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/kaolackcommune.sn/privkey.pem /var/www/kaolack/ssl/key.pem
docker exec kaolack-nginx nginx -s reload
EOF
    
    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Ajouter à crontab
    (crontab -l 2>/dev/null | grep -v renew-ssl.sh; echo "0 3 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    log_success "Renouvellement SSL automatique configuré"
}

# ====================================
# Build et démarrage Docker
# ====================================

build_and_start() {
    log_info "Construction et démarrage des conteneurs Docker..."
    
    cd "$APP_DIR"
    
    # Build des images
    docker-compose build --no-cache
    
    # Démarrage des services
    docker-compose up -d
    
    # Attendre que les services soient prêts
    sleep 10
    
    # Vérifier la santé
    log_info "Vérification de la santé des services..."
    docker-compose ps
    
    log_success "Services Docker démarrés"
}

# ====================================
# Initialisation de la base de données
# ====================================

init_database() {
    log_info "Initialisation de la base de données..."
    
    cd "$APP_DIR"
    
    # Attendre que MySQL soit prêt
    log_info "Attente du service MySQL..."
    sleep 5
    
    # Exécuter les migrations
    docker-compose exec -T backend npm run migrate || true
    
    log_success "Base de données initialisée"
}

# ====================================
# Configuration des logs
# ====================================

setup_logging() {
    log_info "Configuration des logs..."
    
    mkdir -p /var/log/kaolack
    touch /var/log/kaolack/app.log
    touch /var/log/kaolack/error.log
    
    chown -R "$USER:$GROUP" /var/log/kaolack
    chmod 755 /var/log/kaolack
    
    # Rotation des logs
    cat > /etc/logrotate.d/kaolack << EOF
/var/log/kaolack/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $GROUP
    sharedscripts
    postrotate
        docker exec kaolack-backend kill -USR1 1 > /dev/null 2>&1 || true
    endscript
}
EOF
    
    log_success "Logs configurés"
}

# ====================================
# Monitoring et auto-restart
# ====================================

setup_monitoring() {
    log_info "Configuration du monitoring et auto-restart..."
    
    # Créer systemd service pour docker-compose
    cat > /etc/systemd/system/kaolack.service << 'EOF'
[Unit]
Description=Kaolack Stories Connect Docker Services
Requires=docker.service
After=docker.service

[Service]
Type=exec
User=root
WorkingDirectory=/var/www/kaolack
ExecStart=/usr/local/bin/docker-compose up
ExecStop=/usr/local/bin/docker-compose down
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable kaolack.service
    
    log_success "Service systemd créé et activé"
}

# ====================================
# Configuration du backup
# ====================================

setup_backup() {
    log_info "Configuration du backup automatique..."
    
    # Créer le script de backup
    cat > /usr/local/bin/backup-kaolack.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/kaolack"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup de la base de données
docker exec kaolack-mysql mysqldump \
    -u root -proot_password_change_me \
    kaolack_db > "$BACKUP_DIR/db_$DATE.sql"

# Compression
gzip "$BACKUP_DIR/db_$DATE.sql"

# Garder seulement les 7 derniers backups
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup effectué: $BACKUP_DIR/db_$DATE.sql.gz"
EOF
    
    chmod +x /usr/local/bin/backup-kaolack.sh
    
    # Ajouter à crontab (tous les jours à 2h du matin)
    (crontab -l 2>/dev/null | grep -v backup-kaolack; echo "0 2 * * * /usr/local/bin/backup-kaolack.sh") | crontab -
    
    # Créer le répertoire
    mkdir -p /var/backups/kaolack
    
    log_success "Backup automatique configuré"
}

# ====================================
# Vérification finale
# ====================================

verify_deployment() {
    log_info "Vérification du déploiement..."
    
    sleep 5
    
    # Vérifier frontend
    if curl -s -k https://localhost 2>/dev/null | grep -q "Kaolack"; then
        log_success "Frontend accessible"
    else
        log_warning "Frontend peut ne pas être entièrement accessible"
    fi
    
    # Vérifier API
    if curl -s -k https://localhost:443/api/health 2>/dev/null | grep -q "ok"; then
        log_success "API accessible"
    else
        log_warning "API peut ne pas être accessible"
    fi
    
    log_success "Déploiement terminé avec succès!"
}

# ====================================
# Menu principal
# ====================================

main() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║   🚀 Déploiement Kaolack VPS Ubuntu      ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_root
    
    log_info "Démarrage du déploiement..."
    log_info "Domaine: $DOMAIN"
    log_info "Répertoire: $APP_DIR"
    
    install_dependencies
    setup_directories
    clone_repo
    setup_environment
    setup_ssl
    setup_ssl_renewal
    build_and_start
    init_database
    setup_logging
    setup_monitoring
    setup_backup
    verify_deployment
    
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║   ✅ Déploiement Réussi!                  ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo ""
    echo "📋 Prochaines étapes:"
    echo "  1. Visitez: https://$DOMAIN"
    echo "  2. API disponible sur: https://$API_DOMAIN/api"
    echo "  3. Vérifiez les logs: docker-compose logs -f"
    echo "  4. Gérez l'app: systemctl status kaolack"
    echo ""
}

# Exécuter
main "$@"
