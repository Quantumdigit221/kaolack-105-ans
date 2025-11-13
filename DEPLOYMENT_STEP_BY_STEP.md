# 📖 Guide Étape par Étape - Déploiement VPS

**Domaine**: `portail.kaolackcommune.sn`  
**Plateforme**: VPS Ubuntu 22.04 LTS ou 24.04 LTS  
**Durée totale**: ~26 minutes  
**Complexité**: Facile (script automatisé)

---

## 🎯 Vue d'ensemble du processus

```
ÉTAPE 1: Préparer VPS (10 min)
    ↓
ÉTAPE 2: Cloner et configurer (5 min)
    ↓
ÉTAPE 3: Déployer avec script (5 min - automatisé)
    ↓
ÉTAPE 4: Vérifier (2 min)
    ↓
✅ APPLICATION EN PRODUCTION
```

---

## 📋 ÉTAPE 1: Préparer le serveur VPS (10 minutes)

### 1.1 - Créer un compte VPS

Choisissez l'un des fournisseurs recommandés:

| Fournisseur | Coût/mois | Région | Specs |
|-------------|-----------|--------|-------|
| DigitalOcean | $5 | Global | 1GB RAM, 1 CPU, 25GB SSD |
| Linode | $5 | Global | 2GB RAM, 1 CPU, 50GB SSD |
| Vultr | $2.50 | Global | 512MB RAM, 1 CPU, 20GB SSD |
| OVH | variable | Europe | Competitive |
| Hetzner | €3.50 | Europe | 1 CPU, 2GB RAM, 20GB SSD |

**Recommandation pour Kaolack Stories Connect:**
- **RAM minimum**: 4GB
- **CPU**: 2+ cores
- **Stockage**: 50GB SSD
- **Coût estimé**: $5-10/mois

### 1.2 - Configuration initiale du VPS

Une fois le VPS créé, vous recevrez:
- **IP adresse** (ex: `192.168.1.100`)
- **Nom d'utilisateur**: `root`
- **Mot de passe** (fourni par email)

### 1.3 - Se connecter en SSH

**Sur Windows (PowerShell):**
```powershell
ssh root@votre_vps_ip
# Entrez le mot de passe quand demandé
```

**Sur Mac/Linux:**
```bash
ssh root@votre_vps_ip
# Entrez le mot de passe quand demandé
```

**Exemple:**
```
ssh root@192.168.1.100
Password: ••••••••
root@vps1234:~#
```

✅ **Vous êtes maintenant connecté au VPS!**

### 1.4 - Configurer le DNS

Chez votre registrar (ex: registrar.sn, namecheap.com), ajoutez les enregistrements A:

```
Nom d'hôte          Type    Valeur
─────────────────────────────────────────
portail             A       192.168.1.100  (remplacer par votre IP VPS)
api                 A       192.168.1.100
www.portail         A       192.168.1.100
```

**Exemple pour kaolackcommune.sn:**
```
portail.kaolackcommune.sn    A    192.168.1.100
api.kaolackcommune.sn         A    192.168.1.100
www.portail.kaolackcommune.sn A    192.168.1.100
```

⏱️ **Note**: Le DNS peut prendre 5-30 minutes à propager. Continuez pendant ce temps.

### 1.5 - Ouvrir les ports firewall

Sur le VPS (toujours en SSH):

```bash
# Installer UFW (firewall)
apt-get update
apt-get install -y ufw

# Autoriser SSH (IMPORTANT!)
ufw allow 22/tcp

# Autoriser HTTP et HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Activer le firewall
ufw enable

# Vérifier
ufw status
```

✅ **Ports configurés!**

---

## 💻 ÉTAPE 2: Cloner et configurer (5 minutes)

### 2.1 - Créer le dossier d'application

Sur le VPS (SSH):

```bash
# Créer le dossier
mkdir -p /var/www
cd /var/www

# Vérifier
pwd  # Devrait afficher: /var/www
ls -la
```

### 2.2 - Cloner le repository

```bash
# Cloner depuis GitHub
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git kaolack
cd kaolack

# Vérifier
ls -la
# Vous devriez voir: deploy.sh, docker-compose.yml, backend/, src/, etc.
```

### 2.3 - Copier le fichier de configuration

```bash
# Copier le template
cp .env.vps.example .env.production

# Vérifier
cat .env.production | head -20
```

### 2.4 - Éditer le fichier .env.production

```bash
# Ouvrir avec nano (éditeur de texte)
nano .env.production
```

**Cherchez et modifiez ces valeurs:**

```ini
# BASE DE DONNÉES - Générer des mots de passe FORTS!
DB_PASSWORD=ChangeMe123456789!            # Minimum 15 caractères
DB_ROOT_PASSWORD=RootChangeMe123456789!   # Minimum 15 caractères

# SÉCURITÉ - Générer des secrets aléatoires
JWT_SECRET=ChangeMe123456789ChangeMe123456789
SESSION_SECRET=ChangeMe123456789ChangeMe789456

# EMAIL (optionnel, pour les notifications)
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app_google
```

**Pour générer des secrets forts sur le VPS:**

```bash
openssl rand -base64 32
# Copier le résultat dans JWT_SECRET

openssl rand -base64 32
# Copier le résultat dans SESSION_SECRET
```

**Comment éditer dans nano:**
1. Trouver la ligne (Ctrl+W)
2. Modifier la valeur
3. Sauvegarder (Ctrl+O, puis Enter)
4. Quitter (Ctrl+X)

✅ **Configuration prête!**

---

## 🚀 ÉTAPE 3: Déployer avec le script (5 minutes - AUTOMATISÉ)

### 3.1 - Rendre le script exécutable

Sur le VPS (dans `/var/www/kaolack`):

```bash
chmod +x deploy.sh
ls -la deploy.sh
# Devrait montrer: -rwxr-xr-x (avec x = exécutable)
```

### 3.2 - Exécuter le script de déploiement

```bash
# Lancer le déploiement (nécessite sudo)
sudo ./deploy.sh
```

**Le script va:**

1. ✅ Mettre à jour les paquets système
2. ✅ Installer Docker et Docker Compose
3. ✅ Cloner le repository
4. ✅ Configurer SSL automatiquement (Let's Encrypt)
5. ✅ Construire les images Docker
6. ✅ Démarrer 5 services:
   - MySQL (Base de données)
   - Redis (Cache)
   - Backend (API Node.js)
   - Frontend (React)
   - Nginx (Web server + reverse proxy)
7. ✅ Initialiser la base de données

**Output attendu:**

```
ℹ️  🚀 Starting VPS Deployment for portail.kaolackcommune.sn
ℹ️  Step 1/8: Updating system packages...
✓ System updated
ℹ️  Step 2/8: Installing Docker and Docker Compose...
✓ Docker installed
✓ Docker Compose installed
...
✓ 🎉 Deployment completed successfully!
```

⏱️ **Cela peut prendre 5-10 minutes. Soyez patient!**

### 3.3 - Vérifier que tout fonctionne

Une fois le script terminé:

```bash
# Voir le statut des services
docker-compose ps

# Sortie attendue:
# NAME      STATUS         PORTS
# mysql     Up 2 minutes
# redis     Up 2 minutes
# backend   Up 2 minutes
# frontend  Up 2 minutes
# nginx     Up 1 minute

# Voir les logs en temps réel
docker-compose logs -f

# (Appuyez sur Ctrl+C pour arrêter les logs)
```

✅ **Déploiement terminé!**

---

## ✅ ÉTAPE 4: Vérifier que l'application fonctionne (2 minutes)

### 4.1 - Attendre que le DNS se propage

Attendez 5-30 minutes pour que vos domaines soient accessibles. Vous pouvez vérifier:

```bash
# Sur votre machine locale (pas le VPS)
nslookup portail.kaolackcommune.sn
# Devrait montrer: Address: 192.168.1.100 (votre IP VPS)
```

### 4.2 - Tester le frontend

Ouvrez votre navigateur et allez à:

```
http://portail.kaolackcommune.sn
```

**Attendu:**
- ✅ Page d'accueil de Kaolack Stories Connect
- ✅ Logo et images chargés correctement
- ✅ Pas de messages d'erreur dans la console (F12)

### 4.3 - Tester l'API

```bash
# Depuis votre machine locale (pas le VPS)
curl https://api.kaolackcommune.sn/api/health

# Réponse attendue:
# {"status":"OK","message":"Kaolack Stories Connect API","timestamp":"..."}
```

### 4.4 - Vérifier les certificats SSL

```bash
# Le site devrait avoir un cadenas vert 🔒
# Cliquer sur le cadenas > Certificat > Vérifier que c'est "Let's Encrypt"
```

### 4.5 - Vérifier depuis le VPS

```bash
# Sur le VPS (SSH)
docker-compose ps
docker-compose logs --tail 20 backend
docker-compose logs --tail 20 nginx

# Tout devrait être "Up"
```

✅ **APPLICATION EN PRODUCTION!**

---

## 📊 Résumé - URLs finales

| Service | URL |
|---------|-----|
| **Frontend** | https://portail.kaolackcommune.sn |
| **API** | https://api.kaolackcommune.sn/api |
| **Health Check** | https://api.kaolackcommune.sn/api/health |

---

## 🆘 Troubleshooting rapide

### Le site affiche "ERR_NAME_NOT_RESOLVED"

→ Le DNS n'a pas encore propagé. Attendre 5-30 minutes et réessayer.

### Le site affiche "Connection Refused"

→ Le VPS n'est pas accessible. Vérifier:
```bash
# Sur le VPS (SSH)
docker-compose ps
# Les services doivent être "Up"
```

### SSL Certificate Error

→ Attendre 2-3 minutes après le déploiement. Let's Encrypt configure le certificat automatiquement.

### API ne répond pas

```bash
# Sur le VPS (SSH)
docker-compose logs -f backend
# Cherchez les erreurs
```

### Oublié le mot de passe BD

→ Les credentials sont dans `/var/www/kaolack/.env.production`
```bash
cat /var/www/kaolack/.env.production | grep DB_
```

---

## 🔄 Commandes utiles après déploiement

### Voir les logs

```bash
# Tous les logs
docker-compose logs -f

# Logs du backend seulement
docker-compose logs -f backend

# Logs du Nginx
docker-compose logs -f nginx

# Arrêter les logs (Ctrl+C)
```

### Redémarrer les services

```bash
# Redémarrer tout
docker-compose restart

# Redémarrer un service
docker-compose restart backend
docker-compose restart mysql
docker-compose restart nginx
```

### Mettre à jour l'application

```bash
# Aller au dossier
cd /var/www/kaolack

# Récupérer les derniers changements
git pull origin main

# Rebuild et redémarrer
docker-compose up -d --build
```

### Sauvegarder la base de données

```bash
# Dump de la BD
docker-compose exec mysql mysqldump \
    -u kaolack_user -p \
    kaolack_db > backup_$(date +%Y%m%d).sql

# Résultat: backup_20251113.sql
```

---

## 📞 Support et ressources

| Ressource | URL |
|-----------|-----|
| Docker Documentation | https://docs.docker.com |
| Let's Encrypt | https://letsencrypt.org |
| Ubuntu Docs | https://ubuntu.com/support |
| GitHub Issues | https://github.com/Quantumdigit221/kaolack-105-ans/issues |

---

## 🎉 Prochaines étapes

Maintenant que votre app est en production:

1. **Configurer les backups automatiques**
   - Sauvegarder la BD régulièrement
   - Stocker les backups sur un cloud (S3, Dropbox)

2. **Configurer le monitoring**
   - Mettre en place des alertes
   - Surveiller la disponibilité

3. **Optimiser les performances**
   - Ajouter un CDN (CloudFlare)
   - Configurer Redis cache

4. **Sécuriser davantage**
   - Configurer un WAF (Web Application Firewall)
   - Mettre en place 2FA

5. **Analytics**
   - Ajouter Google Analytics
   - Tracker les utilisateurs

---

**Bonne chance avec votre déploiement! 🚀**

Si vous avez besoin d'aide, consultez `DEPLOYMENT_VPS.md` pour plus de détails.
