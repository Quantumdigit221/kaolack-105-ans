#!/bin/bash

# ==========================================
# SCRIPT D'INSTALLATION VPS - KAOLACK 105 ANS
# ==========================================

echo "🚀 INSTALLATION DU VPS POUR KAOLACK 105 ANS..."

# Variables
VPS_USER="root"
VPS_IP="51.68.70.83"  # IP VPS configurée

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

# Installation et configuration du VPS
ssh $VPS_USER@$VPS_IP << 'EOF'
    echo "🔧 MISE À JOUR DU SYSTÈME..."
    apt update && apt upgrade -y
    
    echo "📦 INSTALLATION DES PAQUETS REQUIS..."
    apt install -y curl wget git nginx mysql-server nodejs npm build-essential
    
    echo "🔧 INSTALLATION DE NODE.JS 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    echo "🗄️ CONFIGURATION DE MYSQL..."
    mysql -u root -e "
        CREATE DATABASE IF NOT EXISTS kaolack_stories CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER IF NOT EXISTS 'kaolack_user'@'localhost' IDENTIFIED BY 'kaolack_password_2024';
        GRANT ALL PRIVILEGES ON kaolack_stories.* TO 'kaolack_user'@'localhost';
        FLUSH PRIVILEGES;
    "
    
    echo "📁 CRÉATION DES RÉPERTOIRES..."
    mkdir -p /var/www/kaolack
    mkdir -p /var/www/kaolack/uploads
    mkdir -p /var/backups/kaolack
    
    echo "👤 CRÉATION DE L'UTILISATEUR WWW-DATA..."
    useradd -r -s /bin/false www-data 2>/dev/null || true
    
    echo "🔐 CONFIGURATION DES PERMISSIONS..."
    chown -R www-data:www-data /var/www/kaolack
    chmod -R 755 /var/www/kaolack
    
    echo "🌐 CONFIGURATION DE NGINX..."
    cat > /etc/nginx/sites-available/kaolack-105-ans << 'NGINX_CONF'
server {
    listen 80;
    server_name portail.kaolackcommune.sn www.portail.kaolackcommune.sn;
    
    # Frontend
    location / {
        root /var/www/kaolack/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache statique
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/kaolack/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
NGINX_CONF
    
    echo "🔗 ACTIVATION DU SITE NGINX..."
    ln -sf /etc/nginx/sites-available/kaolack-105-ans /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    echo "🔧 TEST DE LA CONFIGURATION NGINX..."
    nginx -t
    
    echo "🌐 REDÉMARRAGE DE NGINX..."
    systemctl enable nginx
    systemctl restart nginx
    
    echo "🔥 CONFIGURATION DU FIREWALL..."
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
    
    echo "📦 INSTALLATION DE PM2 (Process Manager)..."
    npm install -g pm2
    
    echo "📁 CRÉATION DU FICHIER DE CONFIGURATION PM2..."
    cat > /var/www/kaolack/ecosystem.config.js << 'PM2_CONF'
module.exports = {
  apps: [{
    name: 'kaolack-backend',
    script: './backend/server.js',
    cwd: '/var/www/kaolack',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'kaolack_stories',
      DB_USER: 'kaolack_user',
      DB_PASSWORD: 'kaolack_password_2024',
      JWT_SECRET: 'kaolack-105-ans-super-secret-key-2024',
      JWT_EXPIRES_IN: '7d',
      FRONTEND_URL: 'https://portail.kaolackcommune.sn'
    }
  }]
};
PM2_CONF
    
    echo "🚀 DÉMARRAGE DE PM2..."
    cd /var/www/kaolack
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "📋 CRÉATION DU SCRIPT DE SAUVEGARDE AUTOMATIQUE..."
    cat > /etc/cron.daily/kaolack-backup << 'BACKUP_SCRIPT'
#!/bin/bash
BACKUP_DIR="/var/backups/kaolack"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup base de données
mysqldump -u kaolack_user -p'kaolack_password_2024' kaolack_stories > $BACKUP_DIR/db_backup_$DATE.sql

# Backup fichiers
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz -C /var/www kaolack

# Nettoyage (garder 7 jours)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
BACKUP_SCRIPT
    
    chmod +x /etc/cron.daily/kaolack-backup
    
    echo "✅ INSTALLATION TERMINÉE"
EOF

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors de l'installation du VPS"
    exit 1
fi

echo ""
log_info "🎉 INSTALLATION DU VPS TERMINÉE AVEC SUCCÈS !"
echo ""
echo "📋 ÉTAPES SUIVANTES :"
echo "   1. IP VPS déjà configurée : 51.68.70.83"
echo "   2. Domaine déjà configuré : portail.kaolackcommune.sn"
echo "   3. Exécuter: ./deploy-update.sh"
echo "   4. Configurer SSL (HTTPS) si nécessaire"
echo ""
echo "🌐 Accès à l'application: https://portail.kaolackcommune.sn"
echo "🔧 Accès à l'API: https://portail.kaolackcommune.sn/api"
echo "📊 Monitoring PM2: ssh root@51.68.70.83 'pm2 status'"
echo ""
log_info "✅ IP VPS configurée : 51.68.70.83"
log_info "✅ Domaine configuré : portail.kaolackcommune.sn"
log_warning "⚠️ Pensez à configurer SSL/HTTPS pour le domaine !"
