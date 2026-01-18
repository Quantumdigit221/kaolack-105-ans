#!/bin/bash

# ========================================
# Script de DÃ©ploiement VPS - Kaolack 105 Ans
# VPS: ubuntu@51.68.70.83
# ========================================

set -e

# Variables
VPS_USER="ubuntu"
VPS_IP="51.68.70.83"
VPS_HOST="$VPS_USER@$VPS_IP"
DOMAIN="portail.kaolackcommune.sn"
PROJECT_DIR="/var/www/kaolack"

echo "ðŸš€ DÃ©ploiement VPS pour Kaolack 105 Ans"
echo "===================================="
echo "ðŸ“ VPS: $VPS_HOST"
echo "ðŸŒ Domaine: $DOMAIN"
echo ""

# Test de connexion au VPS
echo "ðŸ” Test de connexion au VPS..."
if ! ssh -o ConnectTimeout=10 $VPS_HOST "echo 'Connexion OK'"; then
    echo "âŒ Impossible de se connecter au VPS $VPS_HOST"
    echo "ðŸ’¡ VÃ©rifiez:"
    echo "   â€¢ Votre clÃ© SSH est bien configurÃ©e"
    echo "   â€¢ L'IP $VPS_IP est correcte"
    echo "   â€¢ Le VPS est accessible"
    exit 1
fi
echo "âœ… Connexion VPS rÃ©ussie"
echo ""

# Fonction pour exÃ©cuter des commandes sur le VPS
exec_ssh() {
    ssh $VPS_HOST "$1"
}

# Fonction pour copier des fichiers vers le VPS
copy_to_vps() {
    scp -r "$1" $VPS_HOST:$2
}

# 1. Mise Ã  jour du systÃ¨me
echo "ðŸ“¦ Mise Ã  jour du systÃ¨me VPS..."
exec_ssh "sudo apt update && sudo apt upgrade -y"

# 2. Installation des dÃ©pendances
echo "ðŸ“¦ Installation des dÃ©pendances..."
exec_ssh "
# Node.js 18+
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
fi

# MySQL
if ! command -v mysql &> /dev/null; then
    sudo apt install mysql-server -y
    sudo mysql_secure_installation <<EOF
y
n
y
y
y
EOF
fi

# Git
if ! command -v git &> /dev/null; then
    sudo apt install git -y
fi

# Certbot
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
fi
"

# 3. Configuration du domaine
echo "ðŸŒ Configuration du domaine..."
echo "âš ï¸  ASSUREZ-VOUS que le domaine $DOMAIN pointe vers $VPS_IP"
echo "   DNS A record: $DOMAIN -> $VPS_IP"
echo ""
read -p "Appuyez sur EntrÃ©e une fois le DNS configurÃ©..."

# 4. Configuration de la base de donnÃ©es
echo "ðŸ—„ï¸  Configuration de la base de donnÃ©es..."
exec_ssh "
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS kaolack_stories CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'kaolack_user'@'localhost' IDENTIFIED BY 'Kaolack2024Secure!';
GRANT ALL PRIVILEGES ON kaolack_stories.* TO 'kaolack_user'@'localhost';
FLUSH PRIVILEGES;
EOF
"

# 5. CrÃ©ation du rÃ©pertoire du projet
echo "ðŸ“ CrÃ©ation du rÃ©pertoire du projet..."
exec_ssh "
sudo mkdir -p $PROJECT_DIR
sudo chown $VPS_USER:$VPS_USER $PROJECT_DIR
"

# 6. Copie des fichiers du projet
echo "ðŸ“¤ Copie des fichiers du projet..."
# Copier tous les fichiers sauf node_modules et .git
tar --exclude='node_modules' --exclude='.git' --exclude='logs' --exclude='.env*' -czf kaolack-deploy.tar.gz .
copy_to_vps kaolack-deploy.tar.gz /tmp/
exec_ssh "
cd /tmp
tar -xzf kaolack-deploy.tar.gz -C $PROJECT_DIR
rm kaolack-deploy.tar.gz
"

# 7. Configuration de l'environnement
echo "âš™ï¸  Configuration de l'environnement..."
exec_ssh "
cd $PROJECT_DIR
if [ ! -f 'backend/.env.production' ]; then
    if [ -f '.env.production.example' ]; then
        cp .env.production.example backend/.env.production
        echo 'âœ… Fichier .env.production crÃ©Ã©'
    else
        echo 'âŒ Fichier .env.production.example non trouvÃ©'
        exit 1
    fi
fi
"

# 8. Installation des dÃ©pendances backend
echo "ðŸ“¦ Installation dÃ©pendances backend..."
exec_ssh "
cd $PROJECT_DIR/backend
npm ci --production
"

# 9. Build du frontend
echo "ðŸ”¨ Build du frontend..."
exec_ssh "
cd $PROJECT_DIR
npm ci
npm run build
"

# 10. Configuration des permissions
echo "ðŸ” Configuration des permissions..."
exec_ssh "
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod -R 777 $PROJECT_DIR/backend/uploads
mkdir -p $PROJECT_DIR/logs
sudo chown -R www-data:www-data $PROJECT_DIR/logs
"

# 11. Configuration Nginx
echo "ðŸŒ Configuration Nginx..."
exec_ssh "
sudo tee /etc/nginx/sites-available/kaolack > /dev/null << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    # Redirection vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # Configuration SSL (sera configurÃ©e par certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # En-tÃªtes de sÃ©curitÃ©
    add_header X-Frame-Options 'SAMEORIGIN' always;
    add_header X-XSS-Protection '1; mode=block' always;
    add_header X-Content-Type-Options 'nosniff' always;
    add_header Referrer-Policy 'no-referrer-when-downgrade' always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;

    # Frontend (fichiers statiques)
    location / {
        root $PROJECT_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache pour les assets statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control 'public, immutable';
        }
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout pour les uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploads
    location /uploads {
        alias $PROJECT_DIR/backend/uploads;
        expires 1y;
        add_header Cache-Control 'public';
    }

    # Logs
    access_log /var/log/nginx/kaolack.access.log;
    error_log /var/log/nginx/kaolack.error.log;
}
EOF

sudo ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
"

# 12. Configuration SSL avec Certbot
echo "ðŸ”’ Configuration SSL..."
exec_ssh "
# D'abord configurer Nginx pour le port 80 seulement
sudo tee /etc/nginx/sites-available/kaolack > /dev/null << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    root $PROJECT_DIR/dist;
    try_files \$uri \$uri/ /index.html;
}
EOF

sudo nginx -t
sudo systemctl reload nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# Restaurer la configuration complÃ¨te
sudo tee /etc/nginx/sites-available/kaolack > /dev/null << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    # Redirection vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # Configuration SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # En-tÃªtes de sÃ©curitÃ©
    add_header X-Frame-Options 'SAMEORIGIN' always;
    add_header X-XSS-Protection '1; mode=block' always;
    add_header X-Content-Type-Options 'nosniff' always;
    add_header Referrer-Policy 'no-referrer-when-downgrade' always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;

    # Frontend
    location / {
        root $PROJECT_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control 'public, immutable';
        }
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploads
    location /uploads {
        alias $PROJECT_DIR/backend/uploads;
        expires 1y;
        add_header Cache-Control 'public';
    }

    access_log /var/log/nginx/kaolack.access.log;
    error_log /var/log/nginx/kaolack.error.log;
}
EOF

sudo nginx -t
sudo systemctl reload nginx
"

# 13. DÃ©marrage du service avec PM2
echo "ðŸš€ DÃ©marrage du service PM2..."
exec_ssh "
cd $PROJECT_DIR
pm2 stop kaolack-backend || true
pm2 delete kaolack-backend || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | sudo bash
"

# 14. Configuration du renouvellement SSL
echo "ðŸ”„ Configuration renouvellement SSL..."
exec_ssh "
echo '0 12 * * * /usr/bin/certbot renew --quiet' | sudo crontab -
"

# 15. Tests post-dÃ©ploiement
echo "ðŸ§ª Tests post-dÃ©ploiement..."
sleep 10

# Test API
if exec_ssh "curl -f http://127.0.0.1:3001/api/health > /dev/null 2>&1"; then
    echo "âœ… API backend fonctionnelle"
else
    echo "âŒ API backend inaccessible"
fi

# Test PM2
if exec_ssh "pm2 list | grep -q 'kaolack-backend.*online'"; then
    echo "âœ… Service PM2 en ligne"
else
    echo "âŒ Service PM2 hors ligne"
fi

# Nettoyage
echo "ðŸ§¹ Nettoyage..."
rm -f kaolack-deploy.tar.gz

echo ""
echo "ðŸŽ‰ DÃ‰PLOIEMENT TERMINÃ‰ !"
echo "========================"
echo ""
echo "ðŸ“Š Informations:"
echo "   â€¢ VPS: $VPS_HOST"
echo "   â€¢ Domaine: $DOMAIN"
echo "   â€¢ URL: https://$DOMAIN"
echo "   â€¢ API: https://$DOMAIN/api"
echo ""
echo "ðŸ”§ Commandes utiles:"
echo "   â€¢ SSH: ssh $VPS_HOST"
echo "   â€¢ Logs: ssh $VPS_HOST 'pm2 logs kaolack-backend'"
echo "   â€¢ Status: ssh $VPS_HOST 'pm2 status'"
echo "   â€¢ Restart: ssh $VPS_HOST 'pm2 restart kaolack-backend'"
echo ""
echo "ðŸŒ AccÃ¨s Ã  l'application:"
echo "   â€¢ Frontend: https://$DOMAIN"
echo "   â€¢ API Health: https://$DOMAIN/api/health"
echo ""
echo "âœ… Votre application Kaolack 105 Ans est maintenant en ligne !"
