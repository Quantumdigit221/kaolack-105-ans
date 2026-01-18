#!/bin/bash

# ========================================
# Script de DÃ©ploiement VPS - Kaolack 105 Ans
# ========================================

set -e

echo "ðŸš€ DÃ©but du dÃ©ploiement VPS pour Kaolack 105 Ans..."

# Variables
PROJECT_DIR="/var/www/kaolack"
BACKUP_DIR="/var/backups/kaolack"
DATE=$(date +%Y%m%d_%H%M%S)
SERVICE_NAME="kaolack-backend"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# VÃ©rifier si on est en root
if [ "$EUID" -ne 0 ]; then
    log_error "Ce script doit Ãªtre exÃ©cutÃ© en tant que root (sudo)"
    exit 1
fi

# 1. Sauvegarde de l'ancienne version
log_info "ðŸ“¦ Sauvegarde de l'ancienne version..."
mkdir -p $BACKUP_DIR
if [ -d "$PROJECT_DIR" ]; then
    cp -r $PROJECT_DIR $BACKUP_DIR/kaolack_$DATE
    log_info "âœ… Sauvegarde crÃ©Ã©e: $BACKUP_DIR/kaolack_$DATE"
fi

# 2. Mise Ã  jour du code
log_info "ðŸ“¥ Mise Ã  jour du code source..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Pull des derniÃ¨res modifications
if [ -d ".git" ]; then
    git pull origin main
else
    log_warn "âš ï¸  Repository Git non trouvÃ©, veuillez cloner manuellement"
    exit 1
fi

# 3. Installation des dÃ©pendances backend
log_info "ðŸ“¦ Installation des dÃ©pendances backend..."
cd backend
npm ci --production

# 4. Configuration de l'environnement
log_info "âš™ï¸  Configuration de l'environnement..."
if [ ! -f ".env.production" ]; then
    if [ -f "../.env.production.example" ]; then
        cp ../.env.production.example .env.production
        log_warn "âš ï¸  Fichier .env.production crÃ©Ã© Ã  partir de .env.production.example"
        log_warn "âš ï¸  VEUILLEZ MODIFIER LES MOTS DE PASSE DANS .env.production"
        exit 1
    else
        log_error "âŒ Fichier .env.production.example non trouvÃ©"
        exit 1
    fi
fi

# 5. Configuration de la base de donnÃ©es
log_info "ðŸ—„ï¸  Configuration de la base de donnÃ©es..."
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS kaolack_stories CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'kaolack_user'@'localhost' IDENTIFIED BY 'Kaolack2024Secure!';
GRANT ALL PRIVILEGES ON kaolack_stories.* TO 'kaolack_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 6. Migration de la base de donnÃ©es
log_info "ðŸ”„ Migration de la base de donnÃ©es..."
npm run migrate || true

# 7. Build du frontend (si nÃ©cessaire)
log_info "ðŸ”¨ Build du frontend..."
cd ../
npm ci
npm run build

# 8. Configuration des permissions
log_info "ðŸ” Configuration des permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 777 $PROJECT_DIR/backend/uploads
mkdir -p $PROJECT_DIR/logs
chown -R www-data:www-data $PROJECT_DIR/logs

# 9. Configuration de PM2
log_info "âš™ï¸  Configuration de PM2..."
cd $PROJECT_DIR

# ArrÃªter l'ancien service
pm2 stop $SERVICE_NAME || true
pm2 delete $SERVICE_NAME || true

# DÃ©marrer le nouveau service
pm2 start ecosystem.config.cjs

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour dÃ©marrer au boot
pm2 startup | bash

# 10. Configuration de Nginx
log_info "ðŸŒ Configuration de Nginx..."
cat > /etc/nginx/sites-available/kaolack << 'EOF'
server {
    listen 80;
    server_name portail.kaolackcommune.sn;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portail.kaolackcommune.sn;

    # Configuration SSL
    ssl_certificate /etc/letsencrypt/live/portail.kaolackcommune.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portail.kaolackcommune.sn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # En-tÃªtes de sÃ©curitÃ©
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (fichiers statiques)
    location / {
        root $PROJECT_DIR/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache pour les assets statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout pour les uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploads
    location /uploads {
        alias $PROJECT_DIR/backend/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Logs
    access_log /var/log/nginx/kaolack.access.log;
    error_log /var/log/nginx/kaolack.error.log;
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration Nginx
nginx -t

# RedÃ©marrer Nginx
systemctl restart nginx

# 11. VÃ©rification du dÃ©ploiement
log_info "ðŸ” VÃ©rification du dÃ©ploiement..."

# VÃ©rifier que le service backend tourne
sleep 5
if pm2 list | grep -q "$SERVICE_NAME.*online"; then
    log_info "âœ… Service backend en ligne"
else
    log_error "âŒ Service backend n'est pas en ligne"
    pm2 logs $SERVICE_NAME --lines 20
    exit 1
fi

# VÃ©rifier que l'API rÃ©pond
if curl -f http://127.0.0.1:3001/api/health > /dev/null 2>&1; then
    log_info "âœ… API backend rÃ©pond correctement"
else
    log_error "âŒ API backend ne rÃ©pond pas"
    pm2 logs $SERVICE_NAME --lines 20
    exit 1
fi

# 12. Finalisation
log_info "ðŸŽ‰ DÃ©ploiement terminÃ© avec succÃ¨s!"
echo ""
echo "ðŸ“Š Informations:"
echo "  â€¢ Service: $SERVICE_NAME"
echo "  â€¢ Port: 3001"
echo "  â€¢ URL: https://portail.kaolackcommune.sn"
echo "  â€¢ Logs: pm2 logs $SERVICE_NAME"
echo ""
echo "ðŸ”§ Commandes utiles:"
echo "  â€¢ Voir les logs: pm2 logs $SERVICE_NAME"
echo "  â€¢ RedÃ©marrer: pm2 restart $SERVICE_NAME"
echo "  â€¢ Status: pm2 status"
echo "  â€¢ Montrer: pm2 monit"
echo ""

# Nettoyage des anciennes sauvegardes (garder les 5 derniÃ¨res)
log_info "ðŸ§¹ Nettoyage des anciennes sauvegardes..."
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs -r rm -rf

log_info "âœ… DÃ©ploiement VPS complÃ©tÃ©!"
