# 📖 Step-by-Step VPS Deployment Guide

**Last Updated**: November 13, 2025  
**Status**: Production Ready ✅

---

## 🎯 Objectif final

Déployer l'application complète sur un serveur VPS Ubuntu avec:
- Frontend React accessible sur https://mairiekaolack.sn
- Backend API accessible sur https://api.mairiekaolack.sn/api
- Base de données MySQL
- Cache Redis
- SSL automatique
- Backups quotidiens

---

## 📋 Prérequis

### Hardware recommandé
```
- 2+ CPU cores
- 4GB+ RAM
- 50GB+ SSD
- Ubuntu 22.04 LTS ou 24.04 LTS
```

### Domaines requis
```
mairiekaolack.sn        (Frontend)
api.mairiekaolack.sn    (API)
www.mairiekaolack.sn    (Alias)
```

### Accès
```
- SSH root access
- ou sudo access
```

---

## 🔧 Phase 1: Préparation du VPS

### Étape 1.1: Connexion initiale

```bash
# Connexion au VPS
ssh root@YOUR_VPS_IP

# Optionnel: Configuration SSH keys
# (À faire sur votre machine locale)
ssh-keygen -t ed25519 -f ~/.ssh/kaolack_vps
ssh-copy-id -i ~/.ssh/kaolack_vps.pub root@YOUR_VPS_IP
```

### Étape 1.2: Mise à jour du système

```bash
# Mettre à jour les paquets
apt-get update
apt-get upgrade -y
apt-get dist-upgrade -y

# Installer les outils essentiels
apt-get install -y curl wget git vim nano build-essential

# Configurer le timezone
timedatectl set-timezone Africa/Dakar

# Vérifier
date
timedatectl
```

### Étape 1.3: Configuration de base de sécurité

```bash
# Configurer les paramètres réseau
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p

# Activer Fail2Ban (anti-brute force)
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Configurer UFW (Firewall)
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable

# Vérifier
ufw status
```

### Étape 1.4: Configuration DNS

**Chez votre registrar (Namecheap, OVH, etc.):**

```
Créer les entrées A:
mairiekaolack.sn        A    YOUR_VPS_IP
www.mairiekaolack.sn    A    YOUR_VPS_IP
api.mairiekaolack.sn    A    YOUR_VPS_IP
```

**Vérifier la propagation DNS (peut prendre 24-48h):**

```bash
# Vous pouvez commencer pendant que ça se propage
nslookup mairiekaolack.sn
dig mairiekaolack.sn +short

# Le résultat doit montrer votre VPS IP
```

---

## 🐳 Phase 2: Installation de Docker

### Étape 2.1: Installer Docker

```bash
# Télécharger et installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh

# Vérifier
docker --version

# Ajouter l'utilisateur root au groupe docker (optionnel)
usermod -aG docker root
```

### Étape 2.2: Installer Docker Compose

```bash
# Télécharger la dernière version
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
chmod +x /usr/local/bin/docker-compose

# Vérifier
docker-compose --version
```

### Étape 2.3: Vérifier l'installation

```bash
docker run hello-world
docker-compose version
```

---

## 📥 Phase 3: Cloner et configurer l'application

### Étape 3.1: Créer les répertoires

```bash
# Créer la structure
mkdir -p /var/www/kaolack
cd /var/www/kaolack

# Créer l'utilisateur (optionnel)
useradd -m -s /bin/bash kaolack 2>/dev/null || true
chown kaolack:kaolack /var/www/kaolack
```

### Étape 3.2: Cloner le repository

```bash
cd /var/www/kaolack

# Cloner
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git .

# Vérifier
ls -la
```

### Étape 3.3: Préparer la configuration

```bash
# Copier le template
cp .env.vps.example .env.production

# Éditer la configuration
nano .env.production
```

### Étape 3.4: Éditer `.env.production`

**Valeurs critiques à modifier:**

```ini
# Domaines - CHANGER !
VITE_API_URL=https://api.mairiekaolack.sn/api
APP_URL=https://mairiekaolack.sn
API_URL=https://api.mairiekaolack.sn
FRONTEND_URL=https://mairiekaolack.sn
CORS_ORIGIN=https://mairiekaolack.sn

# Database passwords - GÉNÉRER des valeurs fortes !
DB_USER=kaolack_user
DB_PASSWORD=CHANGE_ME_8E1kL9pQ2mN5xR7vT4sU3bC9dE
DB_ROOT_PASSWORD=CHANGE_ME_7xY2kJ9pL1mO3nR5qS6tU8vW0x

# Secrets - GÉNÉRER avec: openssl rand -base64 32
JWT_SECRET=CHANGE_ME_generate_with_openssl
SESSION_SECRET=CHANGE_ME_generate_with_openssl

# Email (optionnel)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@mairiekaolack.sn
```

### Étape 3.5: Générer les secrets

```bash
# Terminal 1: Générer JWT_SECRET
openssl rand -base64 32

# Terminal 2: Générer SESSION_SECRET
openssl rand -base64 32

# Terminal 3: Générer DB_PASSWORD
openssl rand -base64 32

# Terminal 4: Générer DB_ROOT_PASSWORD
openssl rand -base64 32

# Copier les valeurs dans .env.production
```

---

## 🔐 Phase 4: Configuration SSL

### Étape 4.1: Installer Certbot

```bash
# Installer
apt-get install -y certbot python3-certbot-nginx

# Vérifier
certbot --version
```

### Étape 4.2: Générer les certificats

```bash
# Créer le répertoire SSL
mkdir -p /var/www/kaolack/ssl

# Générer les certificats pour vos domaines
certbot certonly --standalone \
    -d mairiekaolack.sn \
    -d www.mairiekaolack.sn \
    -d api.mairiekaolack.sn \
    --email admin@mairiekaolack.sn \
    --agree-tos \
    --non-interactive \
    --register-unsafely-without-email

# IMPORTANT: Si DNS n'est pas encore propagé, utilisez:
certbot certonly --manual \
    -d mairiekaolack.sn \
    -d www.mairiekaolack.sn \
    -d api.mairiekaolack.sn
# (Et suivre les instructions pour vérifier les DNS TXT records)
```

### Étape 4.3: Copier les certificats

```bash
# Copier les certificats
cp /etc/letsencrypt/live/mairiekaolack.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/mairiekaolack.sn/privkey.pem /var/www/kaolack/ssl/key.pem

# Permissions
chmod 644 /var/www/kaolack/ssl/cert.pem
chmod 600 /var/www/kaolack/ssl/key.pem

# Vérifier
ls -la /var/www/kaolack/ssl/
```

---

## 🚀 Phase 5: Déploiement

### Étape 5.1: Vérifier la configuration

```bash
cd /var/www/kaolack

# Vérifier les fichiers critiques
ls -la docker-compose.yml
ls -la .env.production
ls -la backend/Dockerfile
ls -la frontend.Dockerfile
ls -la nginx.conf
ls -la ssl/

# Vérifier l'accès à GitHub
git status
```

### Étape 5.2: Build des images Docker

```bash
cd /var/www/kaolack

# Build
docker-compose build --no-cache

# Cela peut prendre 5-10 minutes...
# Vous devriez voir:
# - "Building backend..."
# - "Building frontend..."
# - "Successfully built..."
```

### Étape 5.3: Démarrer les services

```bash
# Démarrer en arrière-plan
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Vous devriez voir 5 services "running":
# - kaolack-mysql
# - kaolack-redis
# - kaolack-backend
# - kaolack-frontend
# - kaolack-nginx
```

### Étape 5.4: Attendre que tout soit prêt

```bash
# Attendre 30 secondes que MySQL se démarre
sleep 30

# Vérifier les logs
docker-compose logs --tail 50

# Vérifier la santé des services
docker-compose ps

# Si une service a un problème, voir:
docker-compose logs backend   # Logs du backend
docker-compose logs mysql     # Logs de MySQL
```

### Étape 5.5: Initialiser la base de données

```bash
cd /var/www/kaolack

# Attendre que MySQL soit vraiment prêt
sleep 10

# Exécuter les migrations
docker-compose exec -T backend npm run migrate

# Vous devriez voir:
# "Connected to database..."
# "Migrations completed successfully..."
```

### Étape 5.6: Vérifier le déploiement

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Ou tester directement
curl -k https://localhost 2>/dev/null | head -20
curl -k https://localhost:443/api/health 2>/dev/null | head -20
```

---

## ✅ Phase 6: Tests et vérification

### Étape 6.1: Tester via l'interface web

```bash
# Ouvrir dans le navigateur (depuis votre ordinateur):
# Frontend: https://mairiekaolack.sn
# API: https://api.mairiekaolack.sn/api

# Vous pouvez ignorer les avertissements SSL (certificat auto-signé)
```

### Étape 6.2: Tests en ligne de commande

```bash
# Test du frontend
curl -k https://mairiekaolack.sn | grep -o "<title>.*</title>"

# Test de l'API
curl -k https://api.mairiekaolack.sn/api/health

# Test de la base de données (via API)
curl -k https://api.mairiekaolack.sn/api/news

# Test de CORS
curl -k -i https://api.mairiekaolack.sn/api/ \
  -H "Origin: https://mairiekaolack.sn" \
  -H "Access-Control-Request-Method: GET"
```

### Étape 6.3: Exécuter les tests automatisés

```bash
cd /var/www/kaolack

# Rendre exécutable
chmod +x test-deployment.sh

# Exécuter
./test-deployment.sh

# Résultat attendu:
# ✓ Frontend is accessible
# ✓ API health check passed
# ✓ SSL/TLS certificates valid
# ✓ Docker services running
# ✓ MySQL is healthy
# ... etc
```

---

## 🔄 Phase 7: Configuration de la maintenance

### Étape 7.1: Configurer l'auto-restart

```bash
# Créer un service systemd
cat > /etc/systemd/system/kaolack.service << 'EOF'
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
EOF

# Activer
systemctl daemon-reload
systemctl enable kaolack.service
systemctl start kaolack.service

# Vérifier
systemctl status kaolack
```

### Étape 7.2: Configurer le renouvellement SSL automatique

```bash
# Créer le script de renouvellement
cat > /usr/local/bin/renew-kaolack-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/mairiekaolack.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/mairiekaolack.sn/privkey.pem /var/www/kaolack/ssl/key.pem
docker exec kaolack-nginx nginx -s reload
EOF

chmod +x /usr/local/bin/renew-kaolack-ssl.sh

# Ajouter à crontab (3h du matin tous les jours)
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/renew-kaolack-ssl.sh") | crontab -

# Vérifier
crontab -l
```

### Étape 7.3: Configurer les backups

```bash
# Créer le script de backup
cat > /usr/local/bin/backup-kaolack.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/kaolack"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup de la base de données
docker exec kaolack-mysql mysqldump \
    -u root -pCHANGE_ME_root_password \
    kaolack_db > "$BACKUP_DIR/db_$DATE.sql"

gzip "$BACKUP_DIR/db_$DATE.sql"

# Garder seulement les 7 derniers backups
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/backup-kaolack.sh

# Créer le répertoire
mkdir -p /var/backups/kaolack

# Ajouter à crontab (2h du matin tous les jours)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-kaolack.sh") | crontab -

# Tester manuellement
/usr/local/bin/backup-kaolack.sh

# Vérifier
ls -la /var/backups/kaolack/
```

---

## 🎯 Phase 8: Configuration finale

### Étape 8.1: Configurer les logs

```bash
# Créer le répertoire de logs
mkdir -p /var/log/kaolack
touch /var/log/kaolack/app.log

# Configurer la rotation des logs
cat > /etc/logrotate.d/kaolack << 'EOF'
/var/log/kaolack/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 kaolack kaolack
}
EOF

# Tester
logrotate -f /etc/logrotate.d/kaolack
```

### Étape 8.2: Configuration des alertes (optionnel)

```bash
# Installer mail (pour les notifications)
apt-get install -y mailutils

# Tester
echo "Test email" | mail -s "Test" admin@mairiekaolack.sn
```

### Étape 8.3: Vérification finale

```bash
cd /var/www/kaolack

# Status des services
docker-compose ps

# Logs récents
docker-compose logs --tail 20

# Utilisation des ressources
docker stats --no-stream

# Certificats SSL
openssl x509 -in ssl/cert.pem -noout -dates

# Espace disque
df -h

# Connexion à la base de données
docker-compose exec -T mysql mysql -u kaolack_user -p -e "SELECT 1;"
```

---

## ✨ Résultat final attendu

```
✅ Frontend:            https://mairiekaolack.sn
✅ API:                 https://api.mairiekaolack.sn/api
✅ Health Check:        https://api.mairiekaolack.sn/api/health
✅ SSL Certificate:     Valid (Let's Encrypt)
✅ Database:            Connected (MySQL 8.0)
✅ Cache:               Working (Redis 7)
✅ Docker Services:     5/5 running
✅ Backups:             Automated daily
✅ SSL Renewal:         Automated
✅ Auto-restart:        Enabled
```

---

## 📞 Troubleshooting rapide

### Service ne démarre pas

```bash
# Voir les logs
docker-compose logs backend

# Redémarrer
docker-compose restart backend

# Reconstruire
docker-compose build --no-cache && docker-compose up -d
```

### Port déjà utilisé

```bash
# Trouver le processus
lsof -i :3001
lsof -i :3306

# Tuer le processus
kill -9 <PID>
```

### Base de données inaccessible

```bash
# Vérifier MySQL
docker-compose exec mysql mysql -u root -p -e "SELECT 1;"

# Restart
docker-compose restart mysql

# Vérifier les logs
docker-compose logs mysql
```

### SSL Certificate expire

```bash
# Renouveler manuellement
certbot renew --force-renewal

# Copier
cp /etc/letsencrypt/live/mairiekaolack.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/mairiekaolack.sn/privkey.pem /var/www/kaolack/ssl/key.pem

# Redémarrer Nginx
docker-compose restart nginx
```

---

## 🎉 Félicitations!

Votre application **Kaolack Stories Connect** est maintenant en production sur votre VPS Ubuntu!

**Prochaines étapes (optionnel):**
1. Configurer un CDN (CloudFlare)
2. Mettre en place des analytics
3. Configurer les emails
4. Optimiser les performances
5. Mettre en place un monitoring avancé

**Bonne chance! 🚀**
