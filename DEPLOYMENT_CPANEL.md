# 🚀 Guide Complet - Déploiement sur cPanel (LWS)

**Domaine**: `portail.kaolackcommune.sn`  
**Plateforme**: cPanel (LWS Hosting)  
**Date**: Novembre 13, 2025

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Architecture de déploiement](#architecture-de-déploiement)
3. [Déploiement du frontend](#déploiement-du-frontend)
4. [Déploiement du backend](#déploiement-du-backend)
5. [Configuration MySQL](#configuration-mysql)
6. [Tests et vérification](#tests-et-vérification)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## 📦 Prérequis

### Accès cPanel
- ✅ Compte cPanel chez LWS Hosting activé
- ✅ Accès à `https://lws-hosting.com:2083` (ou votre URL cPanel)
- ✅ Nom d'utilisateur et mot de passe cPanel
- ✅ Terminal/SSH accès (optionnel mais recommandé)

### Domaine configuré
- ✅ Domaine principal: `kaolackcommune.sn`
- ✅ Sous-domaine créé: `portail.kaolackcommune.sn` (créer via cPanel si nécessaire)
- ✅ Sous-domaine API (optionnel): `api.kaolackcommune.sn`

### Fichiers nécessaires
- ✅ `dist-cpanel.zip` — build frontend (fourni)
- ✅ `backend/` dossier — code Node.js
- ✅ `backend/.env.production` — configuration backend

---

## 🏗️ Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                    Utilisateur                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ DNS Routing    │
                    └───┬────────┬───┘
                        │        │
         ┌──────────────┘        └──────────────┐
         │                                       │
    ┌────▼─────────────┐           ┌────────────▼────┐
    │ portail.kaolack  │           │ api.kaolack     │
    │ commune.sn       │           │ commune.sn      │
    │ (Frontend)       │           │ (Backend)       │
    │                  │           │                 │
    │ cPanel public_html          │ (External Node  │
    │ Static React/Vite           │  or cPanel Node)│
    │ Build (dist/)               │                 │
    └────────────────┘           └────────────────┘
             │                            │
             └────────────┬───────────────┘
                          │
                    ┌─────▼──────┐
                    │ MySQL (cPanel)
                    │ Database   │
                    └────────────┘
```

---

## 📤 Déploiement du frontend

### Étape 1: Préparer les fichiers

**Localement (sur votre machine):**

```bash
# Si vous n'avez pas encore construit
npm run build

# Vérifier que le dossier dist/ existe
ls -la dist/

# Créer l'archive pour upload
Compress-Archive -Path .\dist\* -DestinationPath .\dist-cpanel.zip -Force
```

### Étape 2: Uploader sur cPanel

**Méthode A - File Manager (plus simple)**

1. Connectez-vous à cPanel: `https://lws-hosting.com:2083`
2. Allez à **File Manager**
3. Naviguez vers le dossier du sous-domaine:
   - Cherchez `public_html/portail.kaolackcommune.sn` ou
   - Si le sous-domaine est racine, utilisez `public_html/`
4. Créez le dossier s'il n'existe pas (ex: `portail.kaolackcommune.sn`)
5. Uploadez `dist-cpanel.zip` dans ce dossier
6. Clic-droit > **Extract** (ou utilisez le menu Extract)
7. Confirmez l'extraction

**Méthode B - FTP/SFTP**

```bash
# Si vous avez un client FTP (FileZilla, WinSCP, etc.)
Host: lws-hosting.com
Port: 21 (FTP) ou 22 (SFTP)
Username: votre_utilisateur_cpanel
Password: votre_mot_de_passe

# Naviguer vers public_html/portail.kaolackcommune.sn/
# Uploader le contenu de dist/ directement (pas besoin de zip)
```

**Méthode C - SSH Terminal**

```bash
# SSH vers votre serveur cPanel
ssh utilisateur@lws-hosting.com

# Créer le dossier du sous-domaine (si nécessaire)
mkdir -p public_html/portail.kaolackcommune.sn

# Uploader via SCP (depuis votre machine locale)
# scp -r ./dist/* utilisateur@lws-hosting.com:~/public_html/portail.kaolackcommune.sn/

# Ou via git (si le repo est configuré)
cd public_html/portail.kaolackcommune.sn/
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git .
cd dist/
cp -r . ../
```

### Étape 3: Vérifier l'upload

1. Ouvrez le navigateur: `http://portail.kaolackcommune.sn`
2. Vous devriez voir la page d'accueil
3. Vérifiez la console du navigateur (F12 > Console) pour les erreurs

**Si vous voyez une page blanche:**
- Vérifiez que `index.html` est présent dans le dossier racine du domaine
- Vérifiez que les fichiers JS/CSS sont chargés (onglet Network)
- Vérifiez les logs du serveur: cPanel > Logs

---

## 🔧 Déploiement du backend

### Option 1: cPanel Node.js Manager (si disponible)

**Vérifier la disponibilité:**

1. Connexion cPanel
2. Cherchez **"Setup Node.js App"** ou **"Node.js"** dans le menu
3. Si présent, vous pouvez utiliser cette option

**Configuration:**

```bash
# 1. SSH vers le serveur
ssh utilisateur@lws-hosting.com

# 2. Cloner le repository ou uploader le dossier backend/
cd ~/
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git
cd kaolack-105-ans/backend

# 3. Installer les dépendances
npm install

# 4. Configurer .env.production
cp .env.production .env
nano .env
# Éditer les valeurs (DB_HOST, DB_USER, DB_PASSWORD, CORS_ORIGIN, etc.)
```

**Créer l'app Node.js dans cPanel:**

1. Allez à **Setup Node.js App**
2. Cliquez **Create Application**
3. Configurez:
   - **Node.js version**: 18+ (ou la plus récente disponible)
   - **Application root**: chemin vers votre dossier `backend/` (ex: `/home/utilisateur/kaolack-105-ans/backend`)
   - **Application URL**: `https://api.kaolackcommune.sn` (si sous-domaine créé)
   - **Application Startup File**: `server.js`
   - **Passenger log file**: (laissez par défaut)
4. Cliquez **Create**
5. L'app devrait démarrer automatiquement

**Vérifier le statut:**

- cPanel > **Setup Node.js App** > voir le statut
- Accédez à `https://api.kaolackcommune.sn/api/health` pour vérifier

### Option 2: Hébergement backend externe (recommandé si cPanel ne supporte pas Node.js)

**Services recommandés:**

- **Render** (https://render.com) — gratuit pour les petits projets
- **Railway** (https://railway.app)
- **Fly.io** (https://fly.io)
- **DigitalOcean App Platform** (https://www.digitalocean.com/products/app-platform)

**Exemple avec Render:**

```bash
# 1. Committer et pousser les changements
git add backend/
git commit -m "Configure backend for production"
git push origin main

# 2. Connecter le repo GitHub à Render
#    - Aller sur https://render.com
#    - "Create" > "Web Service"
#    - Sélectionner le repo "kaolack-105-ans"
#    - Configurer:
#      - Name: kaolack-api
#      - Build Command: npm --prefix backend install
#      - Start Command: npm --prefix backend start
#      - Environment: ajouter les variables de .env.production
#      - Region: choisir région proche (Frankfurt, etc.)

# 3. Render génère une URL publique (ex: https://kaolack-api.onrender.com)

# 4. Configurer DNS pour api.kaolackcommune.sn:
#    - cPanel > Zone Editor
#    - Ajouter CNAME:
#      Name: api
#      Target: kaolack-api.onrender.com
```

---

## 🗄️ Configuration MySQL

### Créer la base de données dans cPanel

**Via cPanel:**

1. Allez à **MySQL Databases** (ou **MySQL Wizard**)
2. **Créer une nouvelle base:**
   - Nom: `u123456789_kaolack` (remplacer par votre préfixe)
   - Cliquez **Create Database**

3. **Créer un utilisateur MySQL:**
   - Allez à **MySQL Users**
   - Nom d'utilisateur: `u123456789_kaolack`
   - Mot de passe: Générer un mot de passe fort (ou entrer un custom)
   - Cliquez **Create User**

4. **Donner les permissions:**
   - Allez à **Add User to Database**
   - Sélectionnez l'utilisateur et la base
   - Cochez **ALL PRIVILEGES**
   - Cliquez **Make Changes**

### Mettre à jour backend/.env.production

```bash
# Éditer le fichier backend/.env.production avec les credentials cPanel:

DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456789_kaolack
DB_USER=u123456789_kaolack
DB_PASSWORD=your_generated_password_here
```

### Importer la structure de base (optionnel)

Si vous avez un dump SQL:

```bash
# Via terminal SSH:
mysql -u u123456789_kaolack -p u123456789_kaolack < database_backup.sql

# Via cPanel phpMyAdmin:
# 1. Allez à phpMyAdmin (dans cPanel)
# 2. Sélectionnez la base u123456789_kaolack
# 3. Onglet "Import"
# 4. Upload le fichier .sql
# 5. Cliquez "Go"
```

---

## ✅ Tests et vérification

### 1. Vérifier le frontend

```bash
# Ouvrir dans le navigateur:
http://portail.kaolackcommune.sn

# Attendu: page d'accueil du site Kaolack Stories Connect
```

### 2. Vérifier l'API

```bash
# Test health endpoint
curl -k https://api.kaolackcommune.sn/api/health

# Réponse attendue:
# {"status":"OK","message":"Kaolack Stories Connect API",...}
```

### 3. Vérifier les uploads

```bash
# Créer un fichier de test via API ou File Manager
# Accédez à:
# http://portail.kaolackcommune.sn/uploads/

# Les fichiers uploadés doivent être accessibles
```

### 4. Vérifier les logs

**Frontend:**
- Ouvrez `http://portail.kaolackcommune.sn`
- F12 > Console > vérifiez qu'il n'y a pas d'erreurs

**Backend:**
- SSH terminal: `tail -f ~/logs/access_log` (ou votre chemin de logs)
- cPanel > **Raw Access Logs**

---

## 🚨 Troubleshooting

### Frontend affiche une page blanche

```bash
# 1. Vérifier que index.html est dans le bon dossier
ls -la public_html/portail.kaolackcommune.sn/index.html

# 2. Vérifier les permissions
chmod 755 public_html/portail.kaolackcommune.sn/
chmod 644 public_html/portail.kaolackcommune.sn/*.html

# 3. Vérifier la configuration du domaine
# cPanel > Addon Domains > vérifier que portail.kaolackcommune.sn pointe au bon dossier

# 4. Vérifier les logs
cPanel > Logs > Error Log
```

### API ne répond pas

```bash
# 1. Vérifier le statut Node.js (si cPanel Node manager)
cPanel > Setup Node.js App > vérifier le statut

# 2. Vérifier que .env.production est correct
ssh utilisateur@lws-hosting.com
cat ~/kaolack-105-ans/backend/.env

# 3. Redémarrer l'app
# Via cPanel ou SSH: pm2 restart all (si utilisant PM2)

# 4. Vérifier les logs
tail -f ~/kaolack-105-ans/backend/logs/app.log
```

### Erreur de base de données

```bash
# 1. Vérifier les credentials dans .env
cat backend/.env.production | grep DB_

# 2. Tester la connexion MySQL
mysql -h localhost -u u123456789_kaolack -p
# Entrer le mot de passe et taper: SHOW DATABASES;

# 3. Vérifier que la base existe
mysql -u u123456789_kaolack -p u123456789_kaolack -e "SELECT 1;"

# 4. Vérifier les permissions utilisateur
# cPanel > MySQL Users > vérifier les droits de l'utilisateur
```

### Erreur CORS

```bash
# Si le frontend n'accède pas à l'API:
# 1. Vérifier que CORS_ORIGIN dans backend/.env.production est correct:
CORS_ORIGIN=http://portail.kaolackcommune.sn

# 2. Redémarrer le backend pour appliquer les changements
# Via cPanel Node.js App ou SSH

# 3. Vérifier les headers CORS dans les réponses API:
curl -i -k https://api.kaolackcommune.sn/api/health
# Cherchez: Access-Control-Allow-Origin: http://portail.kaolackcommune.sn
```

### SSL/HTTPS ne fonctionne pas

```bash
# 1. Vérifier que le certificat SSL est installé
cPanel > SSL/TLS > vérifier le statut

# 2. Installer un certificat (gratuit via AutoSSL)
cPanel > SSL/TLS > AutoSSL > Run AutoSSL Now

# 3. Attendre quelques minutes pour la validation

# 4. Forcer HTTPS via htaccess (optionnel)
# Créer/éditer public_html/.htaccess:
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🔄 Maintenance

### Mettre à jour l'application

```bash
# 1. SSH vers le serveur
ssh utilisateur@lws-hosting.com
cd kaolack-105-ans

# 2. Récupérer les derniers changements
git pull origin main

# 3. Réinstaller les dépendances (si nécessaire)
npm --prefix backend install
npm install

# 4. Rebuild frontend (si local)
npm run build

# 5. Uploader la nouvelle build dist/ ou dist-cpanel.zip via cPanel File Manager

# 6. Redémarrer le backend (si cPanel Node ou SSH)
# Via cPanel ou:
pm2 restart all
```

### Sauvegarder la base de données

```bash
# Via SSH:
mysqldump -u u123456789_kaolack -p u123456789_kaolack > backup_$(date +%Y%m%d).sql

# Via cPanel phpMyAdmin:
# 1. Allez à phpMyAdmin
# 2. Sélectionnez la base
# 3. Onglet "Export"
# 4. Choisissez le format (SQL)
# 5. Cliquez "Go"
```

### Restaurer une sauvegarde

```bash
# Via SSH:
mysql -u u123456789_kaolack -p u123456789_kaolack < backup_20251113.sql

# Via cPanel phpMyAdmin:
# 1. Sélectionnez la base
# 2. Onglet "Import"
# 3. Upload le fichier .sql
# 4. Cliquez "Go"
```

### Monitorer les logs

```bash
# Logs erreur du serveur
tail -f ~/logs/error_log

# Logs d'accès HTTP
tail -f ~/logs/access_log

# Logs de l'app Node.js (si SSH)
tail -f ~/kaolack-105-ans/backend/logs/app.log

# Voir les logs d'erreur en temps réel
ssh utilisateur@lws-hosting.com
watch -n 1 'tail -20 ~/logs/error_log'
```

---

## 📞 Support et ressources

### Documentation
- 📖 cPanel Hosting: https://docs.cpanel.net/
- 📖 LWS Support: https://support.lws.fr/
- 📖 Node.js on cPanel: https://docs.cpanel.net/cpanel/software/setup-node-js-app/
- 📖 MySQL sur cPanel: https://docs.cpanel.net/cpanel/databases/mysql-databases/

### Commandes utiles

```bash
# Vérifier l'espace disque
df -h

# Vérifier l'utilisation mémoire
free -h

# Redémarrer le serveur cPanel
sudo /usr/local/cpanel/scripts/restartsrv

# Voir les processus Node.js
ps aux | grep node

# Vérifier les ports ouverts
netstat -tulpn | grep LISTEN
```

### Contacts
- **Support LWS**: contact@lws.fr ou https://support.lws.fr/
- **GitHub**: https://github.com/Quantumdigit221/kaolack-105-ans/issues

---

## 🎉 C'est terminé!

Votre application **Kaolack Stories Connect** est maintenant en production sur cPanel!

**URLs d'accès:**
- 🌐 Frontend: `http://portail.kaolackcommune.sn`
- 📡 API: `https://api.kaolackcommune.sn/api`
- ✅ Health Check: `https://api.kaolackcommune.sn/api/health`

**Prochaines étapes recommandées:**

1. ✅ Configurer HTTPS avec certificat SSL
2. ✅ Configurer les sauvegardes automatiques
3. ✅ Mettre en place les analytics
4. ✅ Configurer les notifications email
5. ✅ Monitorer les performances et les logs

Bonne chance! 🚀
