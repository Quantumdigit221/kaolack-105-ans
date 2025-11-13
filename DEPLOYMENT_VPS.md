# 🚀 Guide de Déploiement sur VPS Ubuntu

Déploiement complet de l'application **Kaolack Stories Connect** sur un serveur VPS Ubuntu avec Docker, SSL, et monitoring.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration du serveur VPS](#configuration-du-serveur-vps)
3. [Installation automatique](#installation-automatique)
4. [Configuration manuelle (optionnel)](#configuration-manuelle)
5. [Vérification du déploiement](#vérification-du-déploiement)
6. [Maintenance et monitoring](#maintenance-et-monitoring)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prérequis

### Serveur VPS recommandé
- **OS**: Ubuntu 22.04 LTS ou Ubuntu 24.04 LTS
- **Processeur**: 2+ cores
- **RAM**: 4GB minimum (8GB recommandé)
- **Stockage**: 50GB SSD minimum
- **Bande passante**: Illimitée
- **Fournisseurs recommandés**: DigitalOcean, Linode, Vultr, OVH, Hetzner

### Domaines
- `kaolackcommune.sn` (frontend)
- `api.kaolackcommune.sn` (backend API)
- `www.kaolackcommune.sn` (alias)

### Connexion SSH
- Accès SSH avec permissions root ou sudo
- Clé SSH configurée (optionnel mais recommandé)

---

## 🛠️ Configuration du serveur VPS

### Étape 1: Connexion au serveur

```bash
# Connexion SSH (remplacer IP et port si nécessaire)
ssh -i ~/.ssh/your_key.pem root@your_vps_ip

# Ou avec mot de passe
ssh root@your_vps_ip
```

### Étape 2: Mise à jour du système

```bash
# Mettre à jour les paquets
apt-get update && apt-get upgrade -y

# Installer les outils essentiels
apt-get install -y curl wget git build-essential
```

### Étape 3: Configuration de base

```bash
# Définir le timezone
timedatectl set-timezone Africa/Dakar

# Configurer les paramètres réseau (optionnel)
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p
```

### Étape 4: Configuration du DNS

Chez votre registrar DNS, pointez:

```
kaolackcommune.sn          A  your_vps_ip
www.kaolackcommune.sn      A  your_vps_ip
api.kaolackcommune.sn      A  your_vps_ip
```

Vérifier:
```bash
dig kaolackcommune.sn
nslookup api.kaolackcommune.sn
```

---

## 🚀 Installation automatique

### Étape 1: Cloner le repository

```bash
cd /tmp
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git
cd kaolack-105-ans
```

### Étape 2: Rendre le script exécutable

```bash
chmod +x deploy.sh
```

### Étape 3: Préparer les configurations

**Copier et configurer .env.production:**

```bash
# Copier depuis le repository
cp .env.production .env.production.backup

# Éditer avec vos valeurs
nano .env.production
```

**Valeurs importantes à configurer:**

```ini
# Domaines
VITE_API_URL=https://api.kaolackcommune.sn/api
APP_URL=https://kaolackcommune.sn
API_URL=https://api.kaolackcommune.sn
FRONTEND_URL=https://kaolackcommune.sn
CORS_ORIGIN=https://kaolackcommune.sn

# Base de données (générer des mots de passe forts!)
DB_PASSWORD=generate_strong_password_here
DB_ROOT_PASSWORD=generate_root_password_here

# JWT & Session (générer des secrets aléatoires)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Email (optionnel pour notifications)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Étape 4: Exécuter le déploiement

```bash
sudo ./deploy.sh
```

Le script effectuera:
- ✅ Installation de Docker et Docker Compose
- ✅ Création des répertoires
- ✅ Clonage du repository
- ✅ Configuration SSL automatique (Let's Encrypt)
- ✅ Build et démarrage des conteneurs
- ✅ Initialisation de la base de données
- ✅ Configuration des sauvegardes automatiques
- ✅ Configuration du monitoring

### Étape 5: Vérification

```bash
# Vérifier le statut
systemctl status kaolack

# Voir les logs
docker-compose -f /var/www/kaolack/docker-compose.yml logs -f

# Accéder à l'application
# Frontend: https://kaolackcommune.sn
# API: https://api.kaolackcommune.sn/api
```

---

## ⚙️ Configuration manuelle (optionnel)

Si vous préférez déployer manuellement:

### 1. Installation de Docker

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh

# Installer Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Ajouter l'utilisateur au groupe docker
usermod -aG docker $USER
```

### 2. Cloner le repository

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git kaolack
cd kaolack
```

### 3. Configuration SSL

```bash
# Installer Certbot
apt-get install -y certbot python3-certbot-nginx

# Générer le certificat
certbot certonly --standalone \
    -d kaolackcommune.sn \
    -d www.kaolackcommune.sn \
    -d api.kaolackcommune.sn \
    --email admin@kaolackcommune.sn \
    --agree-tos \
    --non-interactive

# Copier les certificats
mkdir -p /var/www/kaolack/ssl
cp /etc/letsencrypt/live/kaolackcommune.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/kaolackcommune.sn/privkey.pem /var/www/kaolack/ssl/key.pem
```

### 4. Configuration des variables d'environnement

```bash
cp .env.production /var/www/kaolack/.env
nano /var/www/kaolack/.env

# Générer des secrets
openssl rand -base64 32  # Pour JWT_SECRET
openssl rand -base64 32  # Pour SESSION_SECRET
```

### 5. Démarrer les conteneurs

```bash
cd /var/www/kaolack

# Build des images
docker-compose build

# Démarrage
docker-compose up -d

# Vérifier
docker-compose ps
```

### 6. Initialiser la base de données

```bash
# Vérifier que MySQL est prêt
docker-compose exec mysql mysql -u kaolack_user -p -e "SELECT 1"

# Exécuter les migrations
docker-compose exec backend npm run migrate
```

---

## ✅ Vérification du déploiement

### Vérifier les services

```bash
# Status des conteneurs
docker-compose ps

# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f nginx
```

### Tester l'accessibilité

```bash
# Frontend
curl -k https://kaolackcommune.sn

# API
curl -k https://api.kaolackcommune.sn/api/health

# Domaine API
curl -k https://api.kaolackcommune.sn

# Vérifier les certificats SSL
openssl s_client -connect kaolackcommune.sn:443
openssl s_client -connect api.kaolackcommune.sn:443
```

### Vérifier les certificats SSL

```bash
# Voir la date d'expiration
certbot certificates

# Tester la date d'expiration SSL
openssl s_client -connect kaolackcommune.sn:443 -servername kaolackcommune.sn 2>/dev/null | \
    openssl x509 -noout -dates
```

---

## 🔄 Maintenance et monitoring

### Logs et monitoring

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'erreurs
docker-compose logs --tail 100 backend | grep -i error

# Statistiques des conteneurs
docker stats

# CPU et mémoire
docker-compose ps --format "table {{.Service}}\t{{.Status}}"
```

### Mise à jour de l'application

```bash
cd /var/www/kaolack

# Récupérer les derniers changements
git pull origin main

# Rebuild et redémarrer
docker-compose up -d --build

# Exécuter les migrations si nécessaire
docker-compose exec backend npm run migrate
```

### Sauvegarde manuelle

```bash
# Backup de la base de données
docker-compose exec mysql mysqldump \
    -u kaolack_user -p \
    kaolack_db > backup_$(date +%Y%m%d).sql

# Backup des fichiers
tar -czf kaolack_backup_$(date +%Y%m%d).tar.gz \
    /var/www/kaolack/backend/uploads \
    /var/backups/kaolack/
```

### Restauration de backup

```bash
# Restaurer la base de données
docker-compose exec -T mysql mysql \
    -u kaolack_user -p \
    kaolack_db < backup_20251113.sql
```

### Renouvellement SSL

```bash
# Renouveler manuellement
certbot renew --force-renewal

# Copier les nouveaux certificats
cp /etc/letsencrypt/live/kaolackcommune.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/kaolackcommune.sn/privkey.pem /var/www/kaolack/ssl/key.pem

# Redémarrer Nginx
docker-compose exec nginx nginx -s reload
```

---

## 🚨 Troubleshooting

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs détaillés
docker-compose logs

# Vérifier les ports disponibles
netstat -tlnp | grep LISTEN

# Vérifier l'espace disque
df -h

# Supprimer les conteneurs et redémarrer
docker-compose down
docker-compose up -d
```

### Base de données inaccessible

```bash
# Vérifier la connexion MySQL
docker-compose exec mysql mysql -u root -p -e "SELECT 1;"

# Vérifier les logs MySQL
docker-compose logs mysql

# Restart du service MySQL
docker-compose restart mysql
```

### API inaccessible

```bash
# Vérifier l'application backend
curl http://localhost:3001/api/health

# Voir les logs du backend
docker-compose logs -f backend

# Restart du backend
docker-compose restart backend
```

### Frontend blank / erreurs

```bash
# Vérifier la variable VITE_API_URL
docker-compose exec frontend printenv VITE_API_URL

# Vérifier les logs Nginx
docker-compose logs nginx

# Vérifier la console du navigateur pour les erreurs CORS
```

### Espace disque faible

```bash
# Voir l'utilisation disque
df -h

# Nettoyer les images/conteneurs non utilisés
docker system prune -a

# Nettoyer les volumes
docker volume prune
```

### SSL Certificate expired

```bash
# Vérifier l'expiration
openssl x509 -in /etc/letsencrypt/live/kaolackcommune.sn/cert.pem -noout -dates

# Renouveler
certbot renew --force-renewal

# Copier et redémarrer
cp /etc/letsencrypt/live/kaolackcommune.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
cp /etc/letsencrypt/live/kaolackcommune.sn/privkey.pem /var/www/kaolack/ssl/key.pem
docker-compose restart nginx
```

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifiez les logs**: `docker-compose logs -f`
2. **Testez la connectivité**: `curl -v https://api.kaolackcommune.sn/api/health`
3. **Consultez la documentation Docker**: https://docs.docker.com
4. **Contactez votre fournisseur VPS**: Pour les problèmes serveur

---

## 🔐 Sécurité

### Points importants de sécurité

- ✅ SSL/TLS activé (Let's Encrypt)
- ✅ Firewall configuré (UFW)
- ✅ Rate limiting sur l'API
- ✅ CORS configuré
- ✅ Headers de sécurité ajoutés
- ✅ Backups automatiques quotidiens
- ✅ Renouvellement SSL automatique

### À faire après déploiement

1. **Changer tous les mots de passe par défaut**
   - `DB_PASSWORD`
   - `DB_ROOT_PASSWORD`
   - `JWT_SECRET`
   - `SESSION_SECRET`

2. **Configurer les emails**
   - `SMTP_USER`
   - `SMTP_PASS`

3. **Configurer le monitoring**
   - Activer les alertes
   - Configurer les notifications

4. **Faire un backup initial**
   - Base de données
   - Fichiers uploads

5. **Tester la haute disponibilité**
   - Restart des services
   - Recovery des données

---

## 📊 Monitoring

### Services à monitorer

- **Frontend**: Disponibilité HTTPS
- **Backend API**: Disponibilité et latence
- **Base de données**: Espace, connexions
- **Logs**: Erreurs et avertissements
- **Certificats SSL**: Date d'expiration

### Alertes recommandées

- Service down
- Erreurs 5xx
- Espace disque < 10%
- Certificat SSL expire dans 30 jours
- Augmentation du taux d'erreur

---

## 🎉 C'est terminé!

Votre application **Kaolack Stories Connect** est maintenant en production sur votre VPS Ubuntu!

**Adresses utiles:**
- Frontend: https://kaolackcommune.sn
- API: https://api.kaolackcommune.sn/api
- Documentation API: https://api.kaolackcommune.sn/api/docs

**Prochaines étapes:**
1. Configurer un CDN pour les assets statiques
2. Mettre en place des analytics
3. Configurer les notifications email
4. Mettre en place un système de cache Redis
5. Configurer l'autoscaling si nécessaire

Bonne chance! 🚀
