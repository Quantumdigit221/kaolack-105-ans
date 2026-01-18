# 🚀 Guide de Déploiement VPS - Kaolack 105 Ans

## 📋 Prérequis

### Serveur VPS
- Ubuntu 20.04+ ou CentOS 8+
- 2GB RAM minimum
- 20GB SSD minimum
- Accès root/sudo

### Domaine
- Domaine `portail.kaolackcommune.sn` configuré
- DNS A record vers l'IP du VPS
- Certificat SSL (Let's Encrypt recommandé)

### Logiciels requis
```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation PM2
sudo npm install -g pm2

# Installation Nginx
sudo apt install nginx -y

# Installation MySQL
sudo apt install mysql-server -y

# Installation Git
sudo apt install git -y

# Installation Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y
```

## 🔧 Configuration

### 1. Cloner le projet
```bash
sudo mkdir -p /var/www/kaolack
sudo chown $USER:$USER /var/www/kaolack
cd /var/www/kaolack
git clone <votre-repo-url> .
```

### 2. Configurer la base de données
```bash
sudo mysql
CREATE DATABASE kaolack_stories CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kaolack_user'@'localhost' IDENTIFIED BY 'Kaolack2024Secure!';
GRANT ALL PRIVILEGES ON kaolack_stories.* TO 'kaolack_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configurer l'environnement
```bash
# Copier le fichier d'exemple
cp .env.production.example backend/.env.production

# Éditer le fichier
nano backend/.env.production
```

**Variables importantes à vérifier :**
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=kaolack_stories
DB_USER=kaolack_user
DB_PASSWORD=Kaolack2024Secure!

APP_URL=https://portail.kaolackcommune.sn
API_URL=https://portail.kaolackcommune.sn/api
FRONTEND_URL=https://portail.kaolackcommune.sn
CORS_ORIGIN=https://portail.kaolackcommune.sn

JWT_SECRET=votre_secret_super_long_et_unique
```

### 4. Installer les dépendances
```bash
# Backend
cd backend
npm ci --production

# Frontend
cd ..
npm ci
npm run build
```

### 5. Configurer les permissions
```bash
sudo chown -R www-data:www-data /var/www/kaolack
sudo chmod -R 755 /var/www/kaolack
sudo chmod -R 777 /var/www/kaolack/backend/uploads
sudo mkdir -p /var/www/kaolack/logs
sudo chown -R www-data:www-data /var/www/kaolack/logs
```

## 🌐 Configuration Nginx

### 1. Créer le fichier de configuration
```bash
sudo nano /etc/nginx/sites-available/kaolack
```

### 2. Coller la configuration
```nginx
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

    # En-têtes de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (fichiers statiques)
    location / {
        root /var/www/kaolack/dist;
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
        alias /var/www/kaolack/backend/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Logs
    access_log /var/log/nginx/kaolack.access.log;
    error_log /var/log/nginx/kaolack.error.log;
}
```

### 3. Activer le site
```bash
sudo ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Configuration SSL

### 1. Obtenir le certificat
```bash
sudo certbot --nginx -d portail.kaolackcommune.sn
```

### 2. Configurer le renouvellement automatique
```bash
sudo crontab -e
# Ajouter cette ligne
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Démarrage avec PM2

### 1. Démarrer le service
```bash
cd /var/www/kaolack
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 2. Vérifier le statut
```bash
pm2 status
pm2 logs kaolack-backend
```

## 🧪 Tests de déploiement

### 1. Script de test
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

### 2. Tests manuels
```bash
# Health check API
curl https://portail.kaolackcommune.sn/api/health

# Test posts
curl https://portail.kaolackcommune.sn/api/posts

# Test frontend
curl -I https://portail.kaolackcommune.sn
```

## 📊 Monitoring

### PM2 Monitoring
```bash
# Tableau de bord en temps réel
pm2 monit

# Logs en temps réel
pm2 logs kaolack-backend

# Redémarrer le service
pm2 restart kaolack-backend
```

### Logs système
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/kaolack.access.log
sudo tail -f /var/log/nginx/kaolack.error.log

# Logs application
sudo tail -f /var/www/kaolack/logs/kaolack-error.log
```

## 🔧 Maintenance

### Mise à jour du code
```bash
cd /var/www/kaolack
git pull origin main
npm run build
pm2 restart kaolack-backend
```

### Sauvegarde
```bash
# Base de données
sudo mysqldump -u kaolack_user -p kaolack_stories > backup_$(date +%Y%m%d).sql

# Fichiers uploads
sudo tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

## 🚨 Dépannage

### Problèmes courants

1. **Service ne démarre pas**
   ```bash
   pm2 logs kaolack-backend --lines 50
   # Vérifier .env.production
   # Vérifier les permissions
   ```

2. **API inaccessible**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   # Vérifier la configuration proxy
   ```

3. **Base de données inaccessible**
   ```bash
   sudo mysql -u kaolack_user -p kaolack_stories
   # Vérifier les identifiants
   # Vérifier que le service MySQL tourne
   ```

4. **Uploads ne fonctionnent pas**
   ```bash
   sudo chmod -R 777 /var/www/kaolack/backend/uploads
   sudo chown -R www-data:www-data /var/www/kaolack/backend/uploads
   ```

## 📞 Support

En cas de problème :
1. Vérifier les logs avec `pm2 logs kaolack-backend`
2. Exécuter le script de test `./test-deployment.sh`
3. Consulter la documentation du projet

---

**✅ Déploiement terminé !** 

Votre application Kaolack 105 Ans est maintenant en ligne sur `https://portail.kaolackcommune.sn`
