# 🚀 Déploiement cPanel - LWS Hosting

**Domaine**: `105ans.kaolackcommune.sn` (sous-domaine)  
**Hébergeur**: LWS Hosting cPanel  
**Date**: Novembre 13, 2025  
**Statut**: Production Ready

---

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Déploiement du Frontend](#déploiement-du-frontend)
4. [Déploiement du Backend](#déploiement-du-backend)
5. [Configuration SSL/HTTPS](#configuration-sslhttps)
6. [Tests et Vérification](#tests-et-vérification)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Structure cPanel (LWS Hosting)

```
cPanel Account (lws1234567)
├── public_html/
│   ├── kaolackcommune.sn/           (Domaine principal - vacant ou autre site)
│   │
│   └── 105ans.kaolackcommune.sn/    (Sous-domaine - NOTRE FRONTEND)
│       ├── index.html               (Vite build output)
│       ├── assets/                  (CSS, JS, images)
│       └── uploads/                 (Fichiers uploadés - optionnel si API externe)
│
├── Addon Domains / Subdomains
│   └── 105ans.kaolackcommune.sn     (Pointe vers public_html/105ans.kaolackcommune.sn/)
│
└── Node.js App Manager (si disponible)
    └── api.kaolackcommune.sn        (Backend - ou externe: Render, Railway, Fly)
```

### Backend - Trois options

**Option A (Recommandée)**: Backend sur service externe  
- Render, Railway, Fly.io, ou DigitalOcean App Platform
- Domaine: `api.kaolackcommune.sn` pointe vers ce service
- Avantage: Scalabilité, plus d'espace disque, base de données dédiée

**Option B**: Node.js via cPanel (si LWS le supporte)  
- Créer une "Node.js Application" dans cPanel
- Installer sur sous-domaine `api.kaolackcommune.sn`
- Limité en ressources cPanel

**Option C**: PHP API (non recommandée)  
- Complexe, migration du code requise

---

## Prérequis

### Avant de commencer

**Accès cPanel** ✅
- [ ] Identifiant cPanel (ex: lws1234567)
- [ ] Mot de passe cPanel
- [ ] Accès SSH (vérifier dans cPanel → SSH Access)

**Domaine & DNS** ✅
- [ ] Domaine `kaolackcommune.sn` enregistré
- [ ] Sous-domaine `105ans.kaolackcommune.sn` créé dans cPanel
- [ ] DNS pointe vers serveur LWS

**Build Local** ✅
- [ ] Frontend buildé: `npm run build` → `dist/` folder
- [ ] Backend prêt à déployer (Option A/B/C)

**Fichiers Locaux** ✅
- [ ] `.env.production` complété (voir `.env.cpanel.example`)
- [ ] Credentials DB, JWT_SECRET, SMTP configurés

---

## Déploiement du Frontend

### Méthode 1: File Manager cPanel (Simple, Recommandée)

**Étape 1**: Compresser le dossier `dist/`

Sur votre machine locale:
```powershell
# Windows PowerShell
Compress-Archive -Path .\dist\* -DestinationPath .\dist.zip
```

**Étape 2**: Se connecter à cPanel

1. Ouvrir `https://lws-hosting.com:2083` (ou domaine LWS)
2. Entrer identifiant + mot de passe
3. Aller à **File Manager**

**Étape 3**: Créer le dossier du sous-domaine

1. Naviguer vers `/public_html/`
2. Créer un nouveau dossier: `105ans.kaolackcommune.sn`
3. Entrer dans ce dossier

**Étape 4**: Uploader et extraire `dist.zip`

1. Upload `dist.zip` dans le dossier
2. Click droit sur `dist.zip` → **Extract**
3. Confirmer l'extraction

**Étape 5**: Vérifier la structure

Vous devriez avoir:
```
/public_html/105ans.kaolackcommune.sn/
├── index.html
├── assets/
│   ├── ...css files
│   ├── ...js files
│   └── ...images
└── dist.zip  (vous pouvez le supprimer)
```

**Étape 6**: Configurer les redirections (optionnel)

Si vous voulez que `www.105ans.kaolackcommune.sn` redirige vers `105ans.kaolackcommune.sn`:
- Créer un fichier `.htaccess` à la racine:
```apache
# Redirect www to non-www
RewriteEngine On
RewriteCond %{HTTP_HOST} ^www\.105ans\.kaolackcommune\.sn$ [NC]
RewriteRule ^(.*)$ https://105ans.kaolackcommune.sn/$1 [R=301,L]
```

---

### Méthode 2: FTP/SFTP (Avancée, Plus rapide)

**Étape 1**: Configurer FTP dans cPanel

1. cPanel → **FTP Accounts** (ou **FTP & Backup Accounts**)
2. Créer un compte FTP:
   - **FTP Account**: `105ans@kaolackcommune.sn`
   - **Répertoire**: `/public_html/105ans.kaolackcommune.sn/`
   - **Mot de passe**: Fort et sécurisé
3. Cliquer **Create FTP Account**

**Étape 2**: Se connecter via FTP

Utiliser un client FTP (ex: FileZilla, WinSCP):
- **Host**: `ftp.lws-hosting.com` (ou IP du serveur)
- **Username**: `105ans@kaolackcommune.sn`
- **Password**: Le mot de passe créé
- **Port**: 21 (FTP) ou 22 (SFTP)

**Étape 3**: Uploader le contenu de `dist/`

1. Naviguer vers `/105ans.kaolackcommune.sn/` (dossier vide)
2. Uploader tous les fichiers du dossier `dist/` local
   - `index.html`
   - Tout le contenu de `assets/`

---

### Créer le Sous-domaine dans cPanel

**Si pas encore créé**:

1. cPanel → **Addon Domains** (ou **Subdomains**)
2. **Create a New Subdomain**
   - **Subdomain**: `105ans`
   - **Domain**: `kaolackcommune.sn`
   - **Document Root**: `/public_html/105ans.kaolackcommune.sn`
3. Cliquer **Create**

---

## Déploiement du Backend

### Option A: Backend sur Service Externe (RECOMMANDÉE)

Déployer sur une plateforme comme **Render**, **Railway** ou **Fly.io**:

#### Render (Exemple)

**Étape 1**: Forker/cloner le repo sur GitHub
```bash
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git
cd kaolack-105-ans/backend
```

**Étape 2**: Créer un compte Render
- Aller sur `https://render.com`
- Se connecter avec GitHub
- Créer un nouveau **Web Service**

**Étape 3**: Configurer le service
- **Repository**: kaolack-105-ans
- **Branch**: main
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=3001`
  - `DB_HOST=<your-db-host>`
  - `DB_USER=<db_user>`
  - `DB_PASSWORD=<db_pass>`
  - `DB_NAME=kaolack_db`
  - `JWT_SECRET=<random-secure-key>`
  - `FRONTEND_URL=https://105ans.kaolackcommune.sn`
  - Et autres du `.env.production`

**Étape 4**: Récupérer l'URL Render
- Copier le lien auto-généré (ex: `https://kaolack-api.onrender.com`)

**Étape 5**: Configurer le DNS pour `api.kaolackcommune.sn`
- Dans votre registrar DNS:
  - Créer un enregistrement `CNAME`:
    - **Name**: `api`
    - **Points to**: `kaolack-api.onrender.com`

**Étape 6**: Vérifier la connexion
```bash
curl https://api.kaolackcommune.sn/api/health
# Devrait retourner: {"status":"OK","message":"Kaolack Stories Connect API",...}
```

---

### Option B: Node.js Application dans cPanel

**Si LWS supporte Node.js** (vérifier avec support LWS):

1. cPanel → **Setup Node.js App** (ou **Node.js Application Manager**)
2. **Create Node.js Application**
   - **Node.js Version**: 18.x ou 20.x
   - **Application Root**: `/home/lws1234567/nodejs_apps/api/`
   - **Application URL**: `api.kaolackcommune.sn`
   - **Application JS Entrypoint**: `server.js`
   - **Startup File**: `server.js`
3. Cliquer **Create**

4. SSH et télécharger le backend:
```bash
ssh lws1234567@lws-hosting.com
cd ~/nodejs_apps/api/
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git .
cd backend
npm install
```

5. Configurer `.env`:
```bash
cp .env.example .env
nano .env
# Éditer tous les paramètres
```

6. Redémarrer l'app depuis cPanel

---

### Option C: Hébergement Externe - Différent Domaine

Utiliser un hébergeur Node.js compatible (Fly.io, Railway, etc.).

Domaine API peut être:
- `api.kaolackcommune.sn` (via CNAME)
- Ou directement l'URL du service (ex: `kaolack-api-prod.railway.app`)

---

## Configuration SSL/HTTPS

### SSL Auto pour cPanel (LWS)

**LWS inclut AutoSSL (Let's Encrypt gratuit)**:

1. cPanel → **AutoSSL**
2. Vérifier que `105ans.kaolackcommune.sn` est listé
3. Cliquer **Run AutoSSL Now**
4. Attendre quelques minutes

**Vérifier le certificat**:
```bash
curl -I https://105ans.kaolackcommune.sn
# Vous devriez voir HTTP/2 200 avec certificat valide
```

### Forces HTTPS via `.htaccess`

Ajouter à `/public_html/105ans.kaolackcommune.sn/.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# Force non-www → www (ou vice-versa)
RewriteCond %{HTTP_HOST} !^105ans\.kaolackcommune\.sn$ [NC]
RewriteRule ^(.*)$ https://105ans.kaolackcommune.sn/$1 [R=301,L]
```

---

## Tests et Vérification

### 1. Tester le Frontend

```bash
curl -I https://105ans.kaolackcommune.sn
# Résultat attendu: HTTP/2 200
```

Ouvrir dans le navigateur: `https://105ans.kaolackcommune.sn`

Vérifier:
- [ ] Chargement de la page
- [ ] Pas d'erreurs CSS/JS dans la console (F12)
- [ ] Logo et images chargées

### 2. Tester l'API

```bash
# Health Check
curl https://api.kaolackcommune.sn/api/health

# Réponse attendue:
# {"status":"OK","message":"Kaolack Stories Connect API","timestamp":"..."}
```

### 3. Test Complet Frontend → API

1. Ouvrir `https://105ans.kaolackcommune.sn` dans le navigateur
2. Ouvrir DevTools (F12)
3. Aller à l'onglet **Network**
4. Effectuer une action (login, charger des posts, etc.)
5. Vérifier que les requêtes vers `https://api.kaolackcommune.sn/api/*` sont réussies (Status 200)

### 4. Vérifier le `.env` du Frontend Build

Le frontend doit avoir intégré `VITE_API_URL` au build. Pour vérifier:

1. Ouvrir un fichier `.js` dans `dist/assets/`
2. Chercher `api.kaolackcommune.sn` dans le code (Ctrl+F)
3. Doit être présent dans le bundle

Si incorrect, rebuilder:
```bash
npm run build
# Puis réuploader dist/ sur cPanel
```

---

## Troubleshooting

### Problème: "404 Not Found" sur le frontend

**Solution**:
1. Vérifier la structure du dossier:
   ```
   /public_html/105ans.kaolackcommune.sn/
   ├── index.html
   └── assets/
   ```
2. Si `index.html` manque, réuploader `dist/`
3. Vérifier le chemin du sous-domaine dans cPanel

---

### Problème: "CORS Error" ou API non accessible

**Solution**:
1. Vérifier `CORS_ORIGIN` dans `.env` backend:
   ```
   CORS_ORIGIN=https://105ans.kaolackcommune.sn
   ```
2. Redémarrer le backend (Render/cPanel/autre)
3. Vérifier que l'API est accessible: `curl https://api.kaolackcommune.sn/api/health`

---

### Problème: SSL Certificate Error

**Solution**:
1. cPanel → **AutoSSL** → **Run AutoSSL Now**
2. Attendre 5-10 minutes
3. Vérifier: `curl -I https://105ans.kaolackcommune.sn`
4. Si toujours KO, contact support LWS

---

### Problème: Database Connection Error (Backend)

**Solution**:
1. Vérifier `.env` backend:
   ```
   DB_HOST=localhost (ou IP si externe)
   DB_USER=correct_user
   DB_PASSWORD=correct_password
   DB_NAME=kaolack_db
   ```
2. Si MySQL sur cPanel:
   - cPanel → **MySQL Databases** → Vérifier le nom exact
   - Format: `username_dbname` (ex: `lws1234567_kaolack`)
3. Si DB externe (Render, etc.), utiliser l'URL fournie
4. Tester la connexion:
   ```bash
   mysql -h localhost -u kaolack_user -p kaolack_db
   # Ou depuis Render: mysql -h db-host-url -u user -p db
   ```

---

### Problème: Large File Upload Fails

**Solution**:
1. Augmenter limite PHP dans cPanel:
   - cPanel → **PHP Configuration** (ou **MultiPHP INI Editor**)
   - Augmenter: `upload_max_filesize = 100M`
   - Et: `post_max_size = 100M`
2. Vérifier `.env` backend:
   ```
   MAX_FILE_SIZE=50000000  (50 MB)
   ```

---

### Problème: 500 Error sur API

**Solution**:
1. Si backend externe (Render):
   - Ouvrir le dashboard Render
   - Aller à **Logs** et chercher l'erreur
2. Si backend sur cPanel:
   - cPanel → **Node.js App Manager** → voir les logs
   - Ou via SSH:
     ```bash
     ssh user@server
     tail -f /home/user/nodejs_apps/api/app.log
     ```
3. Vérifier `.env`:
   - `JWT_SECRET` défini
   - `DB_PASSWORD` correct
   - Tous les paramètres requis présents

---

## Maintenance

### Mise à jour de l'application

**Frontend** (sur cPanel):

```bash
# Localement, build à nouveau
npm run build

# Zipper dist/
Compress-Archive -Path .\dist\* -DestinationPath .\dist-new.zip

# Uploader sur cPanel (via File Manager ou FTP)
# Extraire et remplacer les fichiers
```

**Backend** (si sur Render/Railway):

```bash
# Commit et push vers GitHub
git add .
git commit -m "Update: message"
git push origin main

# Render redéploiera automatiquement
# Ou déclencher manuellement dans le dashboard Render
```

---

### Backup & Restore

**cPanel Backup**:
- cPanel → **Backup Wizard** (ou **Backup**)
- Télécharger une archive complète du compte
- Sauvegarder localement

**Base de Données**:
```bash
# Depuis SSH cPanel:
mysqldump -u kaolack_user -p kaolack_db > backup.sql

# Télécharger le fichier via FTP
```

---

## Support & Documentation

- **LWS Hosting Support**: https://support.lws.fr/
- **cPanel Docs**: https://docs.cpanel.net/
- **Render Docs** (si backend externe): https://render.com/docs
- **Let's Encrypt**: https://letsencrypt.org/

---

## Résumé Checklist

Avant de déployer en production:

- [ ] Frontend buildé: `npm run build`
- [ ] Sous-domaine `105ans.kaolackcommune.sn` créé dans cPanel
- [ ] Fichiers `dist/` uploadés sur cPanel
- [ ] Backend configuré (Option A/B/C)
- [ ] `.env.production` complété (DB, JWT, etc.)
- [ ] SSL/HTTPS activé et fonctionnel
- [ ] API accessible sur `https://api.kaolackcommune.sn/api/health`
- [ ] Frontend accède à l'API sans erreur CORS
- [ ] Données de test créées (posts, utilisateurs, etc.)
- [ ] Monitoring et alertes configurés (optionnel)
- [ ] Backup automatique activé (cPanel)

---

**Déploiement complété !** 🎉

L'application Kaolack Stories Connect 105 ans est maintenant accessible sur:
- **Frontend**: https://105ans.kaolackcommune.sn
- **API**: https://api.kaolackcommune.sn/api (ou service externe)

Pour toute question ou problème: consulter les sections **Troubleshooting** ou contacter le support LWS.
