# 🚀 Déploiement VPS Ubuntu - Kaolack 105 Ans

## 📋 Informations VPS
- **IP**: 51.68.70.83
- **Utilisateur**: ubuntu
- **Domaine**: portail.kaolackcommune.sn
- **Connexion**: `ssh ubuntu@51.68.70.83`

## ⚡ Déploiement Automatisé (Recommandé)

### 1. Prérequis locaux
```bash
# Avoir une clé SSH configurée pour le VPS
ssh-copy-id ubuntu@51.68.70.83
```

### 2. Configuration DNS (IMPORTANT!)
Avant de lancer le déploiement, assurez-vous que :
```
Type: A
Nom: portail.kaolackcommune.sn
Valeur: 51.68.70.83
TTL: 3600 (ou 1 heure)
```

### 3. Lancer le déploiement
```bash
# Rendre le script exécutable
chmod +x deploy-to-vps.sh

# Lancer le déploiement
./deploy-to-vps.sh
```

Le script va :
- ✅ Mettre à jour le système Ubuntu
- ✅ Installer Node.js, PM2, Nginx, MySQL, Certbot
- ✅ Configurer la base de données
- ✅ Déployer le code
- ✅ Configurer Nginx avec SSL
- ✅ Démarrer le service avec PM2

## 🔧 Déploiement Manuel (Alternative)

### Étape 1: Connexion au VPS
```bash
ssh ubuntu@51.68.70.83
```

### Étape 2: Mise à jour système
```bash
sudo apt update && sudo apt upgrade -y
```

### Étape 3: Installation dépendances
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install nginx -y

# MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Git
sudo apt install git -y

# Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### Étape 4: Configuration base de données
```bash
sudo mysql
```
```sql
CREATE DATABASE kaolack_stories CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kaolack_user'@'localhost' IDENTIFIED BY 'Kaolack2024Secure!';
GRANT ALL PRIVILEGES ON kaolack_stories.* TO 'kaolack_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 5: Déploiement du code
```bash
sudo mkdir -p /var/www/kaolack
sudo chown ubuntu:ubuntu /var/www/kaolack
cd /var/www/kaolack

# Cloner votre repository
git clone <votre-repo-url> .

# Configuration environnement
cp .env.production.example backend/.env.production
nano backend/.env.production  # Éditer les identifiants si nécessaire

# Installation dépendances
cd backend && npm ci --production
cd .. && npm ci && npm run build

# Permissions
sudo chown -R www-data:www-data /var/www/kaolack
sudo chmod -R 755 /var/www/kaolack
sudo chmod -R 777 /var/www/kaolack/backend/uploads
```

### Étape 6: Configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/kaolack
```
Coller la configuration Nginx (voir fichier deploy-to-vps.sh)

```bash
sudo ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 7: Configuration SSL
```bash
sudo certbot --nginx -d portail.kaolackcommune.sn
```

### Étape 8: Démarrage PM2
```bash
cd /var/www/kaolack
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | sudo bash
```

## 🧪 Tests de déploiement

### Test depuis le VPS
```bash
# Health check API
curl http://127.0.0.1:3001/api/health

# Test PM2
pm2 status
pm2 logs kaolack-backend
```

### Test depuis votre machine locale
```bash
# Test frontend
curl -I https://portail.kaolackcommune.sn

# Test API
curl https://portail.kaolackcommune.sn/api/health

# Test posts
curl https://portail.kaolackcommune.sn/api/posts
```

## 🔍 Monitoring

### Commandes PM2 utiles
```bash
# Tableau de bord
pm2 monit

# Logs en temps réel
pm2 logs kaolack-backend

# Redémarrer le service
pm2 restart kaolack-backend

# Voir le statut
pm2 status
```

### Logs système
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/kaolack.access.log
sudo tail -f /var/log/nginx/kaolack.error.log

# Logs MySQL
sudo tail -f /var/log/mysql/error.log
```

## 🚨 Dépannage

### Service ne démarre pas
```bash
# Vérifier les logs PM2
pm2 logs kaolack-backend --lines 50

# Vérifier la configuration
cd /var/www/kaolack
cat backend/.env.production
```

### Problème de base de données
```bash
# Test connexion MySQL
mysql -u kaolack_user -p kaolack_stories

# Vérifier service MySQL
sudo systemctl status mysql
```

### Problème Nginx
```bash
# Tester configuration
sudo nginx -t

# Vérifier status
sudo systemctl status nginx

# Voir logs
sudo tail -f /var/log/nginx/kaolack.error.log
```

### SSL non configuré
```bash
# Forcer la génération de certificat
sudo certbot --nginx -d portail.kaolackcommune.sn --force-renewal

# Vérifier renouvellement
sudo certbot certificates
```

## 📞 Accès rapide

```bash
# Connexion au VPS
ssh ubuntu@51.68.70.83

# Accès direct aux logs
ssh ubuntu@51.68.70.83 'pm2 logs kaolack-backend'

# Redémarrage rapide
ssh ubuntu@51.68.70.83 'pm2 restart kaolack-backend'
```

## 🌐 URLs finales

- **Frontend**: https://portail.kaolackcommune.sn
- **API**: https://portail.kaolackcommune.sn/api
- **Health Check**: https://portail.kaolackcommune.sn/api/health
- **Uploads**: https://portail.kaolackcommune.sn/uploads

---

**✅ Votre application Kaolack 105 Ans sera accessible sur https://portail.kaolackcommune.sn**
