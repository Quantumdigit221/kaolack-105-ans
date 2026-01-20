# ========================================
# GUIDE DÉPLOIEMENT VPS - NGINX
# ========================================

## 🚀 ÉTAPES DE DÉPLOIEMENT

### 1. Prérequis sur le VPS
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y nginx certbot python3-certbot-nginx git curl wget

# Installer Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
sudo npm install -g pm2

# Installer Docker (optionnel)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Cloner le projet
```bash
# Créer le répertoire
sudo mkdir -p /var/www/kaolack
cd /var/www/kaolack

# Cloner le repository
sudo git clone https://github.com/Quantumdigit221/kaolack-105-ans.git .

# Configurer les permissions
sudo chown -R $USER:$USER /var/www/kaolack
sudo chmod -R 755 /var/www/kaolack
```

### 3. Configurer l'environnement
```bash
# Copier et configurer les variables d'environnement
cp .env.production.optimized .env.production

# Éditer le fichier avec vos valeurs
nano .env.production

# Générer les secrets requis :
openssl rand -base64 64  # Pour JWT_SECRET
openssl rand -base64 64  # Pour SESSION_SECRET
openssl rand -base64 32  # Pour COOKIE_SECRET
```

### 4. Configurer Nginx
```bash
# Copier la configuration Nginx optimisée
sudo cp nginx.optimized.conf /etc/nginx/sites-available/kaolack.conf

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/kaolack.conf /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t
```

### 5. Configurer SSL avec Let's Encrypt
```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d portail.kaolackcommune.sn -d www.portail.kaolackcommune.sn

# Pour l'API (optionnel)
sudo certbot --nginx -d api.kaolackcommune.sn
```

### 6. Construire l'application
```bash
# Installer les dépendances
npm install

# Construire pour production
npm run build:production

# Construire le backend si nécessaire
cd backend
npm install
npm run build
cd ..
```

### 7. Démarrer avec PM2
```bash
# Utiliser la configuration PM2 optimisée
pm2 start ecosystem.optimized.config.cjs --env production

# Sauvegarder la configuration PM2
pm2 save

# Configurer le redémarrage automatique au boot
pm2 startup
```

### 8. Redémarrer Nginx
```bash
# Redémarrer Nginx pour appliquer les changements
sudo systemctl restart nginx

# Vérifier le statut
sudo systemctl status nginx
```

## 🔧 CONFIGURATION NGINX

La configuration `nginx.optimized.conf` inclut :

### ✅ Sécurité
- SSL/TLS moderne (TLS 1.2, 1.3)
- HSTS avec preload
- Headers de sécurité complets
- Rate limiting intégré

### ✅ Performance
- Compression Gzip
- Cache statique optimisé
- Keep-alive connections
- Worker processes auto

### ✅ Proxy inversé
- Frontend React sur port 5173
- Backend API sur port 3001
- Support WebSocket
- Headers CORS configurés

## 📊 MONITORING

### Vérifier le statut des services
```bash
# PM2
pm2 status
pm2 logs

# Nginx
sudo nginx -t
sudo systemctl status nginx

# Ports actifs
sudo netstat -tlnp | grep -E ':(80|443|3001|5173)'
```

### Logs
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs PM2
pm2 logs kaolack-backend
```

## 🌐 ACCÈS À L'APPLICATION

- **Frontend** : https://portail.kaolackcommune.sn
- **API** : https://portail.kaolackcommune.sn/api/
- **Health Check** : https://portail.kaolackcommune.sn/api/health

## 🔧 MAINTENANCE

### Mettre à jour l'application
```bash
cd /var/www/kaolack
git pull origin main
npm install
npm run build:production
pm2 reload kaolack-backend
```

### Renouveler SSL (automatique)
```bash
# Test du renouvellement
sudo certbot renew --dry-run

# Forcer le renouvellement
sudo certbot renew
```

### Backup
```bash
# Backup de la base de données
mysqldump -u root -p kaolack_db > backup_$(date +%Y%m%d).sql

# Backup des fichiers
tar -czf kaolack_backup_$(date +%Y%m%d).tar.gz /var/www/kaolack
```

## 🚨 DÉPANNAGE

### Problèmes courants
1. **Erreur 502 Bad Gateway**
   - Vérifier que le backend tourne : `pm2 status`
   - Vérifier les ports : `sudo netstat -tlnp | grep 3001`

2. **Erreur 504 Gateway Timeout**
   - Augmenter les timeouts dans Nginx
   - Vérifier la performance du backend

3. **SSL non valide**
   - Vérifier la configuration Certbot
   - Renouveler manuellement : `sudo certbot renew`

4. **Permissions refusées**
   - Vérifier les permissions : `ls -la /var/www/kaolack`
   - Corriger : `sudo chown -R www-data:www-data /var/www/kaolack`

### Logs détaillés
```bash
# Logs PM2 en temps réel
pm2 logs --lines 100

# Logs Nginx avec détails
sudo tail -f /var/log/nginx/error.log -n 100
```

## 📈 OPTIMISATIONS

### Performance Nginx
```bash
# Optimiser les workers (généralement = nombre de CPU cores)
sudo nano /etc/nginx/nginx.conf
# worker_processes auto;

# Activer le cache
sudo nano /etc/nginx/sites-available/kaolack.conf
# Ajouter les directives de cache déjà présentes
```

### Performance Node.js
```bash
# Augmenter la limite de fichiers
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimiser PM2
pm2 delete kaolack-backend
pm2 start ecosystem.optimized.config.cjs --env production
```

## 🔐 SÉCURITÉ ADDITIONNELLE

### Firewall UFW
```bash
# Activer le firewall
sudo ufw enable

# Autoriser les ports nécessaires
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001  # Backend (si accès direct requis)

# Vérifier le statut
sudo ufw status
```

### Fail2Ban
```bash
# Installer Fail2Ban
sudo apt install fail2ban

# Configurer pour Nginx
sudo nano /etc/fail2ban/jail.local
```

Cette configuration assure une production robuste, sécurisée et performante pour l'application Kaolack 105 Ans !
