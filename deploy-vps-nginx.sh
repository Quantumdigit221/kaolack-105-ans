# ========================================
# SCRIPT DÉPLOIEMENT VPS - KAOLACK 105 ANS
# ========================================

#!/bin/bash

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DÉPLOIEMENT KAOLACK 105 ANS - VPS${NC}"
echo -e "${BLUE}========================================${NC}"

# Vérifier si on est en root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Erreur: Ce script doit être exécuté en root (sudo)${NC}"
    exit 1
fi

# ========================================
# 1. NETTOYAGE ET PRÉREQUIS
# ========================================
echo -e "${YELLOW}1. Nettoyage et installation des prérequis...${NC}"

# Mettre à jour le système
apt update && apt upgrade -y

# Installer les dépendances essentielles
apt install -y nginx certbot python3-certbot-nginx git curl wget unzip htop

# Installer Node.js 18.x
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installation de Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Installer PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installation de PM2...${NC}"
    npm install -g pm2
fi

# ========================================
# 2. CRÉATION DES RÉPERTOIRES
# ========================================
echo -e "${YELLOW}2. Création des répertoires...${NC}"

mkdir -p /var/www/kaolack
mkdir -p /var/www/kaolack/uploads
mkdir -p /var/www/kaolack/logs
mkdir -p /var/www/kaolack/backups

# ========================================
# 3. CLONAGE DU PROJET
# ========================================
echo -e "${YELLOW}3. Clonage du projet...${NC}"

cd /var/www/kaolack

# Sauvegarder l'ancienne configuration si elle existe
if [ -d ".git" ]; then
    echo -e "${YELLOW}Sauvegarde de l'ancienne configuration...${NC}"
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null
fi

# Cloner la dernière version
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git temp_kaolack

# Déplacer les fichiers
cp -r temp_kaolack/* .
cp -r temp_kaolack/.* . 2>/dev/null

# Nettoyer
rm -rf temp_kaolack

# ========================================
# 4. CONFIGURATION DES PERMISSIONS
# ========================================
echo -e "${YELLOW}4. Configuration des permissions...${NC}"

chown -R www-data:www-data /var/www/kaolack
chmod -R 755 /var/www/kaolack
chmod -R 777 /var/www/kaolack/uploads

# ========================================
# 5. CONFIGURATION DE L'ENVIRONNEMENT
# ========================================
echo -e "${YELLOW}5. Configuration de l'environnement...${NC}"

if [ ! -f ".env.production" ]; then
    cp .env.production.optimized .env.production
    echo -e "${RED}ATTENTION: Veuillez éditer .env.production avec vos vraies valeurs!${NC}"
    echo -e "${YELLOW}Commande: nano /var/www/kaolack/.env.production${NC}"
    read -p "Appuyez sur Entrée après avoir configuré .env.production..."
fi

# ========================================
# 6. INSTALLATION DES DÉPENDANCES
# ========================================
echo -e "${YELLOW}6. Installation des dépendances...${NC}"

npm install

# ========================================
# 7. CONSTRUCTION DE L'APPLICATION
# ========================================
echo -e "${YELLOW}7. Construction de l'application...${NC}"

npm run build:production

# ========================================
# 8. CONFIGURATION NGINX
# ========================================
echo -e "${YELLOW}8. Configuration de Nginx...${NC}"

# Copier la configuration Nginx
cp nginx.optimized.conf /etc/nginx/sites-available/kaolack.conf

# Créer le lien symbolique
ln -sf /etc/nginx/sites-available/kaolack.conf /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Configuration Nginx valide!${NC}"
else
    echo -e "${RED}Erreur de configuration Nginx!${NC}"
    exit 1
fi

# ========================================
# 9. CONFIGURATION SSL
# ========================================
echo -e "${YELLOW}9. Configuration SSL...${NC}"

# Arrêter Nginx temporairement
systemctl stop nginx

# Obtenir le certificat SSL
certbot --nginx -d portail.kaolackcommune.sn --non-interactive --agree-tos --email admin@kaolackcommune.sn --redirect

# ========================================
# 10. DÉMARRAGE DES SERVICES
# ========================================
echo -e "${YELLOW}10. Démarrage des services...${NC}"

# Démarrer Nginx
systemctl start nginx
systemctl enable nginx

# Démarrer avec PM2
if [ -f "ecosystem.optimized.config.cjs" ]; then
    pm2 start ecosystem.optimized.config.cjs --env production
else
    # Démarrage manuel si le fichier n'existe pas
    cd /var/www/kaolack/backend
    pm2 start server.production.js --name kaolack-backend --env production
fi

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique
pm2 startup

# ========================================
# 11. VÉRIFICATION DU DÉPLOIEMENT
# ========================================
echo -e "${YELLOW}11. Vérification du déploiement...${NC}"

# Vérifier les services
echo -e "${BLUE}Statut Nginx:${NC}"
systemctl status nginx --no-pager -l

echo -e "${BLUE}Statut PM2:${NC}"
pm2 status

# Vérifier les ports
echo -e "${BLUE}Ports actifs:${NC}"
netstat -tlnp | grep -E ':(80|443|3001)'

# Test de l'API
echo -e "${BLUE}Test de l'API locale:${NC}"
curl -s -o /dev -w "%{http_code}" http://localhost:3001/api/health || echo "API non accessible"

# ========================================
# 12. INFORMATIONS FINALES
# ========================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${BLUE}Application disponible à:${NC}"
echo -e "${GREEN}https://portail.kaolackcommune.sn${NC}"

echo -e "${BLUE}API disponible à:${NC}"
echo -e "${GREEN}https://portail.kaolackcommune.sn/api/${NC}"

echo -e "${BLUE}Health Check:${NC}"
echo -e "${GREEN}https://portail.kaolackcommune.sn/api/health${NC}"

echo -e "${YELLOW}Logs PM2: pm2 logs kaolack-backend${NC}"
echo -e "${YELLOW}Logs Nginx: journalctl -u nginx -f${NC}"

echo -e "${BLUE}Pour mettre à jour:${NC}"
echo -e "${YELLOW}cd /var/www/kaolack && git pull && npm install && npm run build:production && pm2 reload kaolack-backend${NC}"

echo -e "${GREEN}========================================${NC}"
