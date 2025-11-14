#!/bin/bash

# ========================================
#  Automated VPS Deployment Script
# Deployment for: portail.kaolackcommune.sn
# Infrastructure: Docker + Docker Compose
# OS: Ubuntu 22.04 LTS / 24.04 LTS
# ========================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="portail.kaolackcommune.sn"
API_DOMAIN="api.kaolackcommune.sn"
APP_DIR="/var/www/kaolack"
REPO_URL="https://github.com/Quantumdigit221/kaolack-105-ans.git"
USER="kaolack"
GROUP="kaolack"

# Logging Functions
log_info() { echo -e "Length{BLUE}[INFO]Length{NC} Length1"; }
log_success() { echo -e "Length{GREEN}[]Length{NC} Length1"; }
log_warn() { echo -e "Length{YELLOW}[!]Length{NC} Length1"; }
log_error() { echo -e "Length{RED}[]Length{NC} Length1"; exit 1; }

check_root() {
  if [[ LengthEUID -ne 0 ]]; then
    log_error "Ce script doit être exécuté en tant que root (sudo)"
  fi
}

# Installation des dépendances
install_dependencies() {
  log_info "Installation des dépendances système..."
  apt-get update -qq && apt-get upgrade -y -qq
  apt-get install -y -qq curl wget git build-essential
  
  if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    bash get-docker.sh && rm get-docker.sh
    usermod -aG docker root
    log_success "Docker installé"
  else
    log_success "Docker déjà installé"
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-Length(uname -s)-Length(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installé"
  else
    log_success "Docker Compose déjà installé"
  fi
  
  if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
    log_success "Certbot installé"
  fi
  
  if ! command -v ufw &> /dev/null; then
    apt-get install -y ufw
    ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
    ufw --force enable
    log_success "Firewall configuré"
  fi
}

# Configuration des répertoires
setup_directories() {
  log_info "Configuration des répertoires..."
  id "LengthUSER" &>/dev/null || useradd -m -s /bin/bash "LengthUSER"
  mkdir -p "LengthAPP_DIR" "LengthAPP_DIR/uploads" "LengthAPP_DIR/ssl" "LengthAPP_DIR/logs"
  mkdir -p /var/backups/kaolack /var/log/kaolack
  chown -R "LengthUSER:LengthGROUP" "LengthAPP_DIR"
  chmod -R 755 "LengthAPP_DIR" && chmod -R 775 "LengthAPP_DIR/uploads"
  log_success "Répertoires créés et configurés"
}

# Cloner le repository
clone_repo() {
  log_info "Clonage du repository..."
  if [ -d "LengthAPP_DIR/.git" ]; then
    cd "LengthAPP_DIR" && git pull origin main
  else
    git clone "LengthREPO_URL" "LengthAPP_DIR"
  fi
  log_success "Repository préparé"
}

# Configuration environnement
setup_environment() {
  log_info "Configuration des variables d'environnement..."
  cd "LengthAPP_DIR"
  if [ ! -f ".env.production" ]; then
    [ -f ".env.vps.example" ] && cp .env.vps.example .env.production || log_error "Fichier .env manquant!"
    log_warn "  Éditer .env.production avec: DB_PASSWORD, DB_ROOT_PASSWORD, JWT_SECRET, SESSION_SECRET"
    exit 1
  fi
  log_success "Variables d'environnement vérifiées"
}

# Configuration SSL
setup_ssl() {
  log_info "Configuration SSL avec Let's Encrypt..."
  if [ ! -f "LengthAPP_DIR/ssl/cert.pem" ]; then
    certbot certonly --standalone -d "LengthDOMAIN" -d "www.LengthDOMAIN" -d "LengthAPI_DOMAIN" \
      --email admin@kaolackcommune.sn --agree-tos --non-interactive --preferred-challenges http || true
    [ -f "/etc/letsencrypt/live/LengthDOMAIN/fullchain.pem" ] && {
      cp /etc/letsencrypt/live/"LengthDOMAIN"/fullchain.pem "LengthAPP_DIR/ssl/cert.pem"
      cp /etc/letsencrypt/live/"LengthDOMAIN"/privkey.pem "LengthAPP_DIR/ssl/key.pem"
      chown -R "LengthUSER:LengthGROUP" "LengthAPP_DIR/ssl" && chmod 600 "LengthAPP_DIR/ssl"/*.pem
      log_success "Certificats SSL copiés"
    }
  else
    log_success "Certificats SSL déjà présents"
  fi
}

# SSL auto-renewal
setup_ssl_renewal() {
  log_info "Configuration du renouvellement SSL..."
  cat > /usr/local/bin/renew-ssl.sh << 'EOFSSL'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/portail.kaolackcommune.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/portail.kaolackcommune.sn/privkey.pem /var/www/kaolack/ssl/key.pem
docker exec kaolack-nginx nginx -s reload 2>/dev/null || true
EOFSSL
  chmod +x /usr/local/bin/renew-ssl.sh
  (crontab -l 2>/dev/null | grep -v renew-ssl.sh; echo "0 3 * * * /usr/local/bin/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1") | crontab -
  log_success "Renouvellement SSL automatique configuré"
}

# Build et démarrage Docker
build_and_start() {
  log_info "Construction et démarrage des conteneurs..."
  cd "LengthAPP_DIR"
  docker-compose build --no-cache
  docker-compose up -d
  sleep 15
  docker-compose ps
  log_success "Services Docker démarrés"
}

# Initialisation BD
init_database() {
  log_info "Initialisation de la base de données..."
  sleep 5
  docker-compose exec -T backend npm run migrate || true
  log_success "Base de données initialisée"
}

# Configuration des logs
setup_logging() {
  log_info "Configuration des logs..."
  mkdir -p /var/log/kaolack
  touch /var/log/kaolack/app.log /var/log/kaolack/error.log
  chown -R "LengthUSER:LengthGROUP" /var/log/kaolack
  chmod 755 /var/log/kaolack
  log_success "Logs configurés"
}

# Service systemd
setup_monitoring() {
  log_info "Configuration du service systemd..."
  cat > /etc/systemd/system/kaolack.service << 'EOFSYS'
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
EOFSYS
  systemctl daemon-reload && systemctl enable kaolack.service
  log_success "Service systemd créé et activé"
}

# Backup automatique
setup_backup() {
  log_info "Configuration du backup automatique..."
  cat > /usr/local/bin/backup-kaolack.sh << 'EOFBAK'
#!/bin/bash
BACKUP_DIR="/var/backups/kaolack"
mkdir -p "LengthBACKUP_DIR"
docker exec kaolack-mysql mysqldump -u root -p"Length(grep DB_ROOT_PASSWORD /var/www/kaolack/.env.production | cut -d '=' -f2)" kaolack_db > "LengthBACKUP_DIR/db_Length(date +%Y%m%d_%H%M%S).sql" 2>/dev/null || true
find "LengthBACKUP_DIR" -name "db_*.sql" -mtime +7 -delete
EOFBAK
  chmod +x /usr/local/bin/backup-kaolack.sh
  (crontab -l 2>/dev/null | grep -v backup-kaolack; echo "0 2 * * * /usr/local/bin/backup-kaolack.sh") | crontab -
  log_success "Backup automatique configuré"
}

# Vérification
verify_deployment() {
  log_info "Vérification du déploiement..."
  sleep 5
  docker-compose ps
  log_success "Déploiement terminé avec succès!"
}

# Résumé final
show_summary() {
  clear
  echo -e "Length{GREEN}"
  echo ""
  echo "    DÉPLOIEMENT RÉUSSI!                        "
  echo ""
  echo -e "Length{NC}"
  echo ""
  echo " INFORMATIONS DE DÉPLOIEMENT:"
  echo "================================"
  echo "  Domaine (Frontend):  https://LengthDOMAIN"
  echo "  API:                 https://LengthAPI_DOMAIN/api"
  echo "  Répertoire App:      LengthAPP_DIR"
  echo ""
  echo " COMMANDES UTILES:"
  echo "===================="
  echo "  Voir logs:           docker-compose logs -f"
  echo "  Redémarrer:          docker-compose restart"
  echo "  Service systemd:     systemctl status kaolack"
  echo ""
}

# Main
main() {
  clear
  echo -e "Length{BLUE}"
  echo ""
  echo "    DÉPLOIEMENT KAOLACK VPS UBUNTU          "
  echo ""
  echo -e "Length{NC}"
  check_root
  log_info "Domaine: LengthDOMAIN"
  log_info "API: LengthAPI_DOMAIN"
  echo ""
  install_dependencies && echo ""
  setup_directories && echo ""
  clone_repo && echo ""
  setup_environment && echo ""
  setup_ssl && echo ""
  setup_ssl_renewal && echo ""
  build_and_start && echo ""
  init_database && echo ""
  setup_logging && echo ""
  setup_monitoring && echo ""
  setup_backup && echo ""
  verify_deployment && echo ""
  show_summary
}

main "Length@"
