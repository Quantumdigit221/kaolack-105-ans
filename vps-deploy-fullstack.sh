#!/bin/bash

# =========================================
# SCRIPT DE DÉPLOIEMENT VPS FULL-STACK
# Kaolack Stories Connect - Option 2
# =========================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du déploiement Full-Stack Kaolack..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
PROJECT_NAME="kaolack-stories-connect"
DEPLOY_DIR="/var/www/kaolack"
BACKEND_PORT="3001"
FRONTEND_PORT="3000"
NGINX_PORT="80"

# =========================================
# Étape 1: Vérification des prérequis
# =========================================
echo -e "${BLUE}📋 Étape 1: Vérification des prérequis...${NC}"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js non trouvé. Installation...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker non trouvé. Installation...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Vérifier si Docker Compose est installé  
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose non trouvé. Installation...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Vérifier si Nginx est installé
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx non trouvé. Installation...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

echo -e "${GREEN}✅ Prérequis vérifiés${NC}"

# =========================================
# Étape 2: Création du répertoire de déploiement
# =========================================
echo -e "${BLUE}📁 Étape 2: Préparation du répertoire...${NC}"

sudo mkdir -p $DEPLOY_DIR
sudo chown -R $USER:$USER $DEPLOY_DIR
cd $DEPLOY_DIR

echo -e "${GREEN}✅ Répertoire préparé${NC}"

# =========================================
# Étape 3: Copie des fichiers du projet
# =========================================
echo -e "${BLUE}📦 Étape 3: Déploiement des fichiers...${NC}"

# Copier tous les fichiers nécessaires
cp -r ./dist $DEPLOY_DIR/
cp -r ./backend $DEPLOY_DIR/
cp -r ./src $DEPLOY_DIR/
cp ./package.json $DEPLOY_DIR/
cp ./package-lock.json $DEPLOY_DIR/
cp ./docker-compose.yml $DEPLOY_DIR/
cp ./nginx.conf $DEPLOY_DIR/
cp ./.env.production $DEPLOY_DIR/.env

echo -e "${GREEN}✅ Fichiers copiés${NC}"

# =========================================
# Étape 4: Configuration des variables d'environnement
# =========================================
echo -e "${BLUE}⚙️  Étape 4: Configuration de l'environnement...${NC}"

# Créer le fichier .env de production si il n'existe pas
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo -e "${YELLOW}📝 Création du fichier .env...${NC}"
cat > $DEPLOY_DIR/.env << EOF
NODE_ENV=production
PORT=3001

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=kaolack_user
DB_PASSWORD=kaolack_secure_password_2025
DB_NAME=kaolack_db
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_change_me
JWT_EXPIRY=7d
SESSION_SECRET=your_super_secure_session_secret_change_me

# CORS
CORS_ORIGIN=http://your-domain.com

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Upload
UPLOAD_DIR=/var/www/kaolack/uploads

# Frontend
VITE_API_URL=http://your-domain.com/api
EOF
fi

echo -e "${GREEN}✅ Configuration créée${NC}"

# =========================================
# Étape 5: Installation des dépendances
# =========================================
echo -e "${BLUE}📚 Étape 5: Installation des dépendances...${NC}"

# Installation frontend
cd $DEPLOY_DIR
npm install --production

# Installation backend
cd $DEPLOY_DIR/backend
npm install --production

echo -e "${GREEN}✅ Dépendances installées${NC}"

# =========================================
# Étape 6: Build du frontend
# =========================================
echo -e "${BLUE}🔨 Étape 6: Build du frontend...${NC}"

cd $DEPLOY_DIR
npm run build

echo -e "${GREEN}✅ Frontend buildé${NC}"

# =========================================
# Étape 7: Configuration de la base de données
# =========================================
echo -e "${BLUE}🗃️  Étape 7: Configuration MySQL...${NC}"

# Installer MySQL si nécessaire
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL non trouvé. Installation...${NC}"
    sudo apt-get install -y mysql-server
    sudo mysql_secure_installation
fi

# Créer la base de données et l'utilisateur
echo -e "${YELLOW}📝 Configuration de la base de données...${NC}"
sudo mysql << EOF
CREATE DATABASE IF NOT EXISTS kaolack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'kaolack_user'@'localhost' IDENTIFIED BY 'kaolack_secure_password_2025';
GRANT ALL PRIVILEGES ON kaolack_db.* TO 'kaolack_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✅ Base de données configurée${NC}"

# =========================================
# Étape 8: Configuration Nginx
# =========================================
echo -e "${BLUE}🌐 Étape 8: Configuration Nginx...${NC}"

# Créer la configuration Nginx
sudo tee /etc/nginx/sites-available/kaolack << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Répertoire racine pour les fichiers statiques
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
        proxy_pass http://localhost:3001/api/;
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
sudo ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx configuré${NC}"

# =========================================
# Étape 9: Configuration PM2 pour le backend
# =========================================
echo -e "${BLUE}⚡ Étape 9: Configuration PM2...${NC}"

# Installer PM2 globalement
sudo npm install -g pm2

# Créer la configuration PM2
cat > $DEPLOY_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'kaolack-backend',
    script: './backend/server.js',
    cwd: '$DEPLOY_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/kaolack-backend-error.log',
    out_file: '/var/log/pm2/kaolack-backend-out.log',
    log_file: '/var/log/pm2/kaolack-backend-combined.log',
    time: true
  }]
};
EOF

# Créer le répertoire de logs PM2
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Démarrer l'application avec PM2
cd $DEPLOY_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}✅ PM2 configuré et application démarrée${NC}"

# =========================================
# Étape 10: Configuration du firewall
# =========================================
echo -e "${BLUE}🔥 Étape 10: Configuration du firewall...${NC}"

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo -e "${GREEN}✅ Firewall configuré${NC}"

# =========================================
# Étape 11: Tests de déploiement
# =========================================
echo -e "${BLUE}🧪 Étape 11: Tests de déploiement...${NC}"

# Test du backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend opérationnel${NC}"
else
    echo -e "${RED}❌ Erreur backend${NC}"
fi

# Test du frontend via Nginx
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend opérationnel${NC}"
else
    echo -e "${RED}❌ Erreur frontend${NC}"
fi

echo -e "${GREEN}✅ Tests terminés${NC}"

# =========================================
# RÉSUMÉ FINAL
# =========================================
echo -e "${BLUE}"
echo "=================================================================="
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "=================================================================="
echo -e "${NC}"
echo -e "${GREEN}📋 Résumé de l'installation:${NC}"
echo "   • Frontend React : http://your-domain.com"
echo "   • API Backend : http://your-domain.com/api"
echo "   • Base de données MySQL configurée"
echo "   • PM2 process manager actif"
echo "   • Nginx reverse proxy configuré"
echo ""
echo -e "${YELLOW}🔧 Commandes utiles:${NC}"
echo "   • Voir les logs backend : pm2 logs kaolack-backend"
echo "   • Redémarrer backend : pm2 restart kaolack-backend"
echo "   • Recharger Nginx : sudo systemctl reload nginx"
echo "   • Voir status services : pm2 status"
echo ""
echo -e "${BLUE}⚠️  Actions requises:${NC}"
echo "   1. Modifier 'your-domain.com' dans /etc/nginx/sites-available/kaolack"
echo "   2. Configurer SSL/HTTPS avec Let's Encrypt si nécessaire"
echo "   3. Modifier les mots de passe dans $DEPLOY_DIR/.env"
echo "   4. Tester les fonctionnalités de l'application"
echo ""
echo -e "${GREEN}🚀 Votre application Kaolack est maintenant déployée !${NC}"