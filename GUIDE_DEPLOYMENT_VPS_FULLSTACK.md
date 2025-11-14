# 🚀 **GUIDE DE DÉPLOIEMENT VPS FULL-STACK**
## Kaolack Stories Connect - Option 2 (Frontend + Backend)

---

## 📋 **PRÉREQUIS VPS**

### Spécifications minimales recommandées :
- **OS :** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM :** 2GB minimum (4GB recommandé) 
- **CPU :** 2 cœurs minimum
- **Stockage :** 20GB minimum (50GB recommandé)
- **Bande passante :** Illimitée de préférence

### Accès requis :
- Accès SSH root ou utilisateur avec sudo
- Nom de domaine pointant vers l'IP du VPS
- Port 80 et 443 ouverts

---

## 🎯 **MÉTHODE 1 : DÉPLOIEMENT AUTOMATIQUE (RECOMMANDÉ)**

### Étape 1 : Connexion au VPS
```bash
ssh root@votre-ip-vps
# ou 
ssh utilisateur@votre-ip-vps
```

### Étape 2 : Téléchargement du projet
```bash
# Cloner le repository
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git
cd kaolack-105-ans

# Ou télécharger et extraire les fichiers
wget https://github.com/Quantumdigit221/kaolack-105-ans/archive/main.zip
unzip main.zip
cd kaolack-105-ans-main
```

### Étape 3 : Lancement du script automatique
```bash
# Rendre le script exécutable
chmod +x vps-deploy-fullstack.sh

# Lancer le déploiement automatique
sudo ./vps-deploy-fullstack.sh
```

### Étape 4 : Configuration post-déploiement
```bash
# Modifier le nom de domaine dans Nginx
sudo nano /etc/nginx/sites-available/kaolack

# Remplacer 'your-domain.com' par votre vrai domaine
# Exemple : kaolack.sn

# Recharger Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## ⚙️ **MÉTHODE 2 : DÉPLOIEMENT MANUEL**

### Étape 1 : Installation des dépendances système
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Installation Nginx
sudo apt install -y nginx

# Installation PM2 (Process Manager)
sudo npm install -g pm2

# Installation des outils supplémentaires
sudo apt install -y git curl wget unzip
```

### Étape 2 : Configuration MySQL
```bash
# Connexion à MySQL
sudo mysql

# Création de la base de données
CREATE DATABASE kaolack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kaolack_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON kaolack_db.* TO 'kaolack_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 3 : Déploiement des fichiers
```bash
# Création du répertoire de déploiement
sudo mkdir -p /var/www/kaolack
sudo chown -R $USER:$USER /var/www/kaolack
cd /var/www/kaolack

# Copie des fichiers du projet (adapter le chemin source)
cp -r /path/to/your/project/* .

# Installation des dépendances frontend
npm install --production
npm run build

# Installation des dépendances backend
cd backend
npm install --production
cd ..
```

### Étape 4 : Configuration des variables d'environnement
```bash
# Créer le fichier .env principal
nano .env
```

**Contenu du fichier .env :**
```env
NODE_ENV=production
PORT=3001

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=kaolack_user
DB_PASSWORD=votre_mot_de_passe_securise
DB_NAME=kaolack_db
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET=votre_jwt_secret_tres_securise_change_moi
JWT_EXPIRY=7d
SESSION_SECRET=votre_session_secret_tres_securise

# CORS
CORS_ORIGIN=https://votre-domaine.com

# Upload
UPLOAD_DIR=/var/www/kaolack/uploads

# Frontend
VITE_API_URL=https://votre-domaine.com/api
```

### Étape 5 : Configuration PM2
```bash
# Créer le fichier de configuration PM2
nano ecosystem.config.js
```

**Contenu du fichier ecosystem.config.js :**
```javascript
module.exports = {
  apps: [{
    name: 'kaolack-backend',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/kaolack-error.log',
    out_file: '/var/log/pm2/kaolack-out.log',
    time: true
  }]
};
```

```bash
# Créer le répertoire de logs
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Étape 6 : Configuration Nginx
```bash
# Créer la configuration du site
sudo nano /etc/nginx/sites-available/kaolack
```

**Contenu de la configuration Nginx :**
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    root /var/www/kaolack/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/kaolack_access.log;
    error_log /var/log/nginx/kaolack_error.log;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API Backend proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 7 : Configuration du firewall
```bash
# Configuration UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔐 **CONFIGURATION SSL/HTTPS (RECOMMANDÉ)**

### Installation Let's Encrypt
```bash
# Installation Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtention du certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Test de renouvellement automatique
sudo certbot renew --dry-run
```

---

## 📊 **TESTS ET VÉRIFICATION**

### Tests de fonctionnement
```bash
# Test du backend
curl http://localhost:3001/api/health

# Test du frontend
curl http://localhost/

# Test via le domaine
curl https://votre-domaine.com/
curl https://votre-domaine.com/api/health
```

### Monitoring et logs
```bash
# Logs PM2
pm2 logs kaolack-backend

# Status PM2
pm2 status

# Logs Nginx
sudo tail -f /var/log/nginx/kaolack_access.log
sudo tail -f /var/log/nginx/kaolack_error.log

# Status des services
sudo systemctl status nginx
sudo systemctl status mysql
```

---

## 🛠️ **MAINTENANCE ET MISES À JOUR**

### Mise à jour de l'application
```bash
cd /var/www/kaolack

# Sauvegarder la base de données
mysqldump -u kaolack_user -p kaolack_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Mettre à jour le code
git pull origin main

# Réinstaller les dépendances si nécessaire
npm install --production

# Rebuild le frontend
npm run build

# Redémarrer le backend
pm2 restart kaolack-backend
```

### Sauvegarde automatique
```bash
# Créer un script de sauvegarde
sudo nano /usr/local/bin/kaolack-backup.sh
```

**Script de sauvegarde :**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/kaolack"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarde base de données
mysqldump -u kaolack_user -p'mot_de_passe' kaolack_db > $BACKUP_DIR/db_$DATE.sql

# Sauvegarde uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/kaolack/uploads

# Nettoyage (garder 7 jours)
find $BACKUP_DIR -mtime +7 -delete
```

```bash
# Rendre exécutable et programmer
sudo chmod +x /usr/local/bin/kaolack-backup.sh
sudo crontab -e

# Ajouter la ligne suivante pour sauvegarder tous les jours à 2h
0 2 * * * /usr/local/bin/kaolack-backup.sh
```

---

## 🚨 **DÉPANNAGE COURANT**

### Backend ne démarre pas
```bash
# Vérifier les logs PM2
pm2 logs kaolack-backend

# Vérifier la configuration .env
cat /var/www/kaolack/.env

# Vérifier la connexion MySQL
mysql -u kaolack_user -p -e "SHOW DATABASES;"
```

### Frontend ne s'affiche pas
```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les permissions
ls -la /var/www/kaolack/dist/

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Problèmes de performance
```bash
# Monitoring des ressources
htop
df -h
free -h

# Optimisation PM2
pm2 reload kaolack-backend
pm2 monit
```

---

## 📞 **SUPPORT ET RESSOURCES**

- **Repository :** https://github.com/Quantumdigit221/kaolack-105-ans
- **Documentation PM2 :** https://pm2.keymetrics.io/docs/
- **Documentation Nginx :** https://nginx.org/en/docs/
- **Let's Encrypt :** https://letsencrypt.org/getting-started/

---

## ✅ **CHECKLIST DE DÉPLOIEMENT**

- [ ] VPS configuré avec les spécifications minimales
- [ ] Domaine pointant vers l'IP du VPS
- [ ] Node.js 18+ installé
- [ ] MySQL configuré et sécurisé
- [ ] Nginx installé et configuré
- [ ] PM2 installé globalement
- [ ] Fichiers de projet copiés
- [ ] Variables d'environnement configurées
- [ ] Dépendances installées (frontend + backend)
- [ ] Frontend buildé dans `/dist`
- [ ] Backend démarré avec PM2
- [ ] Configuration Nginx active
- [ ] SSL/HTTPS configuré (Let's Encrypt)
- [ ] Firewall configuré (UFW)
- [ ] Tests de fonctionnement OK
- [ ] Monitoring et logs configurés
- [ ] Sauvegardes automatiques configurées

**🎉 Une fois cette checklist complétée, votre application Kaolack Stories Connect est entièrement déployée et opérationnelle !**