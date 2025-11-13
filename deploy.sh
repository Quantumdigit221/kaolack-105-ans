#!/bin/bash#!/bin/bash



# ========================================# Script de déploiement automatique

# 🚀 Script de Déploiement Ubuntu VPSecho "🚀 Déploiement en cours..."

# ========================================

# Utilisation: ./deploy.sh# 1. Construction du frontend

echo "📦 Construction du frontend..."

set -enpm run build



# Couleurs# 2. Création du dossier de déploiement

RED='\033[0;31m'mkdir -p deploy/frontend

GREEN='\033[0;32m'mkdir -p deploy/backend

YELLOW='\033[1;33m'

BLUE='\033[0;34m'# 3. Copie des fichiers frontend (dist)

NC='\033[0m' # No Colorecho "📂 Copie des fichiers frontend..."

cp -r dist/* deploy/frontend/

# Configurationcp .htaccess deploy/frontend/

APP_DIR="/var/www/kaolack"

REPO_URL="https://github.com/Quantumdigit221/kaolack-105-ans.git"# 4. Copie des fichiers backend

DOMAIN="kaolackcommune.sn"echo "📂 Copie des fichiers backend..."

API_DOMAIN="api.kaolackcommune.sn"cp -r backend/* deploy/backend/

USER="kaolack"cp backend/.env.production deploy/backend/.env

GROUP="kaolack"

# 5. Nettoyage des fichiers de développement

# ====================================echo "🧹 Nettoyage..."

# Fonctions utilitairesrm -f deploy/backend/.env.local

# ====================================rm -rf deploy/backend/node_modules



log_info() {echo "✅ Déploiement préparé dans le dossier 'deploy/'"

    echo -e "${BLUE}[INFO]${NC} $1"echo "📝 Instructions:"

}echo "1. Uploadez 'deploy/frontend/' vers public_html/"

echo "2. Uploadez 'deploy/backend/' vers un dossier backend/"

log_success() {echo "3. Configurez les variables d'environnement"

    echo -e "${GREEN}[✓]${NC} $1"echo "4. Installez les dépendances: npm install --production"

}echo "5. Exécutez les migrations: npx sequelize-cli db:migrate"

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Ce script doit être exécuté en tant que root (sudo)"
        exit 1
    fi
}

# ====================================
# Installation des dépendances
# ====================================

install_dependencies() {
    log_info "Installation des dépendances système..."
    
    apt-get update -qq
    
    # Docker
    if ! command -v docker &> /dev/null; then
        log_info "Installation de Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        bash get-docker.sh
        rm get-docker.sh
        usermod -aG docker root
        log_success "Docker installé"
    else
        log_success "Docker déjà installé"
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "Installation de Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        log_success "Docker Compose installé"
    else
        log_success "Docker Compose déjà installé"
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        apt-get install -y git
        log_success "Git installé"
    fi
    
    # Certbot pour SSL
    if ! command -v certbot &> /dev/null; then
        apt-get install -y certbot python3-certbot-nginx
        log_success "Certbot installé"
    fi
    
    # UFW Firewall
    if ! command -v ufw &> /dev/null; then
        apt-get install -y ufw
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        log_success "Firewall configuré"
    fi
}

# ====================================
# Configuration des répertoires
# ====================================

setup_directories() {
    log_info "Configuration des répertoires..."
    
    # Créer l'utilisateur
    if ! id "$USER" &>/dev/null; then
        useradd -m -s /bin/bash "$USER"
        log_success "Utilisateur $USER créé"
    fi
    
    # Créer les répertoires
    mkdir -p "$APP_DIR"
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "$APP_DIR/ssl"
    mkdir -p "$APP_DIR/logs"
    
    # Permissions
    chown -R "$USER:$GROUP" "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    chmod -R 775 "$APP_DIR/uploads"
    
    log_success "Répertoires créés et configurés"
}

# ====================================
# Cloner le repository
# ====================================

clone_repo() {
    log_info "Clonage du repository..."
    
    if [ -d "$APP_DIR/.git" ]; then
        log_info "Mise à jour du repository existant..."
        cd "$APP_DIR"
        git pull origin main
    else
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
    fi
    
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
