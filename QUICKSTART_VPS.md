# 🚀 VPS Ubuntu Deployment - Quick Start

## 📋 En 5 étapes rapides

### 1️⃣ Préparer le serveur VPS

```bash
# Connexion SSH au VPS
ssh root@your_vps_ip

# Mise à jour
apt-get update && apt-get upgrade -y
```

### 2️⃣ Cloner et configurer

```bash
# Cloner le repository
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git /var/www/kaolack
cd /var/www/kaolack

# Copier la configuration
cp .env.vps.example .env.production

# Éditer avec vos valeurs
nano .env.production
```

### 3️⃣ Générer les secrets

```bash
# Génération sécurisée des secrets
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
```

### 4️⃣ Lancer le déploiement

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Exécuter le déploiement (nécessite sudo)
sudo ./deploy.sh
```

### 5️⃣ Vérifier

```bash
# Vérifier le statut
docker-compose ps

# Tester l'application
curl -k https://kaolackcommune.sn
curl -k https://api.kaolackcommune.sn/api/health
```

---

## 📦 Fichiers de déploiement inclus

| Fichier | Description |
|---------|-------------|
| `.env.production` | Variables d'environnement (METTRE À JOUR!) |
| `.env.vps.example` | Template pour la configuration VPS |
| `docker-compose.yml` | Orchestration des services Docker |
| `backend/Dockerfile` | Image Docker pour le backend |
| `frontend.Dockerfile` | Image Docker pour le frontend |
| `nginx.conf` | Configuration Nginx (proxy + SSL) |
| `deploy.sh` | Script d'installation automatique |
| `test-deployment.sh` | Script de test du déploiement |
| `DEPLOYMENT_VPS.md` | Documentation complète |

---

## 🔐 Sécurité - IMPORTANT!

**Avant de déployer:**

- ✅ Générer des mots de passe forts pour:
  - `DB_PASSWORD`
  - `DB_ROOT_PASSWORD`
  - `JWT_SECRET`
  - `SESSION_SECRET`

- ✅ Configurer votre domaine DNS:
  - `kaolackcommune.sn` → your_vps_ip
  - `api.kaolackcommune.sn` → your_vps_ip

- ✅ Ouvrir les ports firewall:
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)

---

## 🐳 Docker Services

Le déploiement crée 5 services:

1. **MySQL** - Base de données
2. **Redis** - Cache
3. **Backend** - API Node.js (port 3001)
4. **Frontend** - React/Vite
5. **Nginx** - Reverse proxy + SSL

---

## 🎯 Accès après déploiement

```
Frontend:     https://kaolackcommune.sn
API:          https://api.kaolackcommune.sn/api
Health Check: https://api.kaolackcommune.sn/api/health
```

---

## 📊 Commandes utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Logs d'un service
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend

# Arrêter tous les services
docker-compose stop

# Démarrer tous les services
docker-compose start

# Reconstruire les images
docker-compose build --no-cache

# Supprimer tout et recréer
docker-compose down
docker-compose up -d
```

---

## ✅ Checklist avant production

- [ ] VPS créé et accessible via SSH
- [ ] DNS pointant vers le VPS
- [ ] `.env.production` configuré avec valeurs correctes
- [ ] Secrets générés (JWT_SECRET, SESSION_SECRET)
- [ ] Script `deploy.sh` exécuté avec succès
- [ ] Tests passés (exécuter `./test-deployment.sh`)
- [ ] Application accessible sur https://kaolackcommune.sn
- [ ] API accessible sur https://api.kaolackcommune.sn/api
- [ ] SSL certificate valide (Let's Encrypt)
- [ ] Backups configurés et testés

---

## 🆘 Troubleshooting rapide

### Erreur: "Container exited with code 1"
```bash
docker-compose logs backend  # Voir les détails
```

### Port déjà utilisé
```bash
lsof -i :3001  # Trouver le processus
kill -9 <PID>  # Tuer le processus
```

### Base de données ne répond pas
```bash
docker-compose restart mysql
docker-compose exec mysql mysql -u root -p -e "SELECT 1;"
```

### SSL certificate pas reconnu
```bash
# Renouveler le certificat
certbot renew --force-renewal
cp /etc/letsencrypt/live/kaolackcommune.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
docker-compose restart nginx
```

---

## 📞 Support

Consultez `DEPLOYMENT_VPS.md` pour la documentation complète.

---

**Prêt à déployer? 🚀**

```bash
cd /var/www/kaolack
sudo ./deploy.sh
```

Bonne chance! 🎉
