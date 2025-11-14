# ✅ Checklist Déploiement cPanel LWS - 105ans.kaolackcommune.sn

**Date**: Novembre 13, 2025  
**Statut**: Prêt pour Production  
**Domaine Frontend**: https://105ans.kaolackcommune.sn  
**Domaine API**: https://api.kaolackcommune.sn (à configurer)

---

## 📋 PRÉ-DÉPLOIEMENT (À FAIRE AVANT)

### Accès & Identifiants
- [ ] **cPanel Access**: URL (ex: https://lws-hosting.com:2083)
- [ ] **cPanel Username**: `lws1234567` (remplacer par le vôtre)
- [ ] **cPanel Password**: Sécurisé et connu
- [ ] **SSH Access**: Activé (optionnel, pour backend)

### Domaines & DNS
- [ ] **Domaine Principal**: `kaolackcommune.sn` enregistré et actif
- [ ] **Sous-domaine**: `105ans.kaolackcommune.sn` (va être créé dans cPanel)
- [ ] **DNS**: Pointe vers serveur LWS
- [ ] **Registrar**: Accès au registrar DNS (si besoin de changer A/CNAME records)

### Fichiers Locaux (Déjà complétés ✅)
- [x] Frontend buildé: `npm run build` → `dist/` folder
- [x] Frontend zippé: `dist-cpanel.zip` créé
- [x] Backend prêt: `backend/` avec `package.json` et `server.js`
- [x] `.env.production` mis à jour pour LWS cPanel
- [x] `.env.cpanel.example` template fourni
- [x] Documentation cPanel: `DEPLOYMENT_CPANEL.md` et `QUICKSTART_CPANEL.md`

### Sécurité
- [ ] **DB Password**: Généré (minimum 16 caractères)
- [ ] **JWT_SECRET**: Généré avec `openssl rand -base64 32`
- [ ] **SESSION_SECRET**: Généré avec `openssl rand -base64 32`
- [ ] **Backup Local**: Copie de `.env.production` sauvegardée

---

## 🚀 DÉPLOIEMENT FRONTEND (Étapes Détaillées)

### Étape 1: Accéder à cPanel

- [ ] Ouvrir: `https://lws-hosting.com:2083` (ou domain LWS)
- [ ] Entrer **Username** et **Password**
- [ ] Accueil cPanel chargé

### Étape 2: File Manager

- [ ] Cliquer: **File Manager** (dans l'accueil)
- [ ] Naviguer: `/public_html/` (dossier racine)

### Étape 3: Créer le Dossier Sous-domaine

- [ ] Créer dossier: `105ans.kaolackcommune.sn`
  - Click droit → **New Folder**
  - Nom: `105ans.kaolackcommune.sn`
- [ ] Entrer dans ce dossier

### Étape 4: Uploader dist-cpanel.zip

- [ ] Uploader fichier: `dist-cpanel.zip`
  - Bouton **Upload** ou drag-drop
  - Attendre la fin (devrait être ~2-5 MB)

### Étape 5: Extraire l'Archive

- [ ] Click droit sur `dist-cpanel.zip`
- [ ] Sélectionner: **Extract**
- [ ] Confirmer extraction
- [ ] Vérifier structure:
  - [ ] `index.html` présent
  - [ ] Dossier `assets/` créé
  - [ ] Images/CSS/JS dans assets/

### Étape 6: Nettoyer

- [ ] Supprimer: `dist-cpanel.zip` (optionnel)
- [ ] Laisser: tous les fichiers `index.html`, `assets/`, etc.

### Étape 7: Créer le Sous-domaine dans cPanel

Si pas encore créé:

- [ ] cPanel → **Addon Domains** (ou **Subdomains**)
- [ ] Cliquer: **Create a New Subdomain**
- [ ] Remplir:
  - [ ] **Subdomain**: `105ans`
  - [ ] **Domain**: `kaolackcommune.sn`
  - [ ] **Document Root**: `/public_html/105ans.kaolackcommune.sn`
- [ ] Cliquer: **Create**

### Étape 8: Activer SSL/HTTPS

- [ ] cPanel → **AutoSSL**
- [ ] Vérifier que `105ans.kaolackcommune.sn` est listé
- [ ] Cliquer: **Run AutoSSL Now**
- [ ] Attendre 2-3 minutes
- [ ] Vérifier: `https://105ans.kaolackcommune.sn` charge

### Résultat Attendu ✅
```
https://105ans.kaolackcommune.sn → Affiche le site
Certificat SSL: Valide (cadenas vert)
```

---

## 🔌 DÉPLOIEMENT BACKEND (Choisir une Option)

### Option A: Service Externe - Render (RECOMMANDÉE)

**Avantages**: Scalable, gratuit (tier de base), configuration simple

- [ ] **Créer un compte Render**: https://render.com
- [ ] **Connecter GitHub**: Autoriser Render
- [ ] **Créer Web Service**:
  - [ ] Repo: `kaolack-105-ans`
  - [ ] Branch: `main`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
- [ ] **Ajouter Environment Variables**:
  - [ ] `NODE_ENV=production`
  - [ ] `DB_HOST=<external-db-host>` (ou localhost si DB LWS)
  - [ ] `DB_USER=kaolack_user`
  - [ ] `DB_PASSWORD=<secure-password>`
  - [ ] `DB_NAME=kaolack_db`
  - [ ] `JWT_SECRET=<generated-secret>`
  - [ ] `SESSION_SECRET=<generated-secret>`
  - [ ] `FRONTEND_URL=https://105ans.kaolackcommune.sn`
  - [ ] `CORS_ORIGIN=https://105ans.kaolackcommune.sn`
  - [ ] Autres du `.env.production`
- [ ] **Déployer**: Cliquer Create Web Service
- [ ] **Attendre le Build**: 2-5 minutes
- [ ] **Copier l'URL**: Ex: `https://kaolack-api.onrender.com`

**Configurer le DNS (Render)**:
- [ ] Accéder à votre **registrar DNS**
- [ ] Créer enregistrement **CNAME**:
  - [ ] **Name**: `api`
  - [ ] **Points to**: `kaolack-api.onrender.com` (la valeur Render)
- [ ] Sauvegarder
- [ ] Attendre propagation (5-30 minutes)

**Vérifier**:
```bash
curl https://api.kaolackcommune.sn/api/health
# Résultat: {"status":"OK","message":"..."}
```

---

### Option B: Node.js sur cPanel (Si Disponible)

**Prérequis**: LWS doit supporter Node.js (demander au support)

- [ ] **Vérifier support**: Contacter support LWS ou chercher "Node.js" dans cPanel
- [ ] **cPanel → Setup Node.js App**:
  - [ ] **Node Version**: 18.x ou 20.x
  - [ ] **App URL**: `api.kaolackcommune.sn`
  - [ ] **App Root**: `/home/lws1234567/nodejs_apps/api/`
  - [ ] **JS Entrypoint**: `server.js`
- [ ] **SSH vers le serveur**:
  ```bash
  ssh lws1234567@lws-hosting.com
  cd ~/nodejs_apps/api/
  git clone https://github.com/Quantumdigit221/kaolack-105-ans.git .
  cd backend
  npm install
  ```
- [ ] **Configurer `.env`**:
  ```bash
  cp .env.example .env
  nano .env
  # Éditer les paramètres (DB, JWT, etc.)
  ```
- [ ] **Redémarrer l'app**: Dans cPanel → Node.js App Manager

**Vérifier**:
```bash
curl https://api.kaolackcommune.sn/api/health
```

---

### Option C: Ne pas utiliser (Ou Provider externe alternatif)

- [ ] Autre provider (Railway, Fly.io, DigitalOcean, etc.)
- [ ] Suivre docs du provider + configurer CNAME DNS

---

## 🧪 TESTS & VÉRIFICATION

### Test Frontend

- [ ] **Ouvrir**: https://105ans.kaolackcommune.sn
- [ ] **Vérifier**:
  - [ ] Page charge (pas 404)
  - [ ] Logo & images visibles
  - [ ] Pas d'erreurs CSS (F12 → Console)
  - [ ] Pas d'erreurs JavaScript (F12 → Console)

### Test API - Health Check

```bash
curl https://api.kaolackcommune.sn/api/health
```

- [ ] **Réponse attendue**:
  ```json
  {
    "status": "OK",
    "message": "Kaolack Stories Connect API",
    "timestamp": "2025-11-13T..."
  }
  ```

### Test CORS et Connectivité

- [ ] **Ouvrir**: https://105ans.kaolackcommune.sn dans navigateur
- [ ] **F12**: Ouvrir DevTools
- [ ] **Network Tab**: Aller à l'onglet Network
- [ ] **Action Test**: Cliquer sur un bouton qui fait un appel API
- [ ] **Vérifier Requêtes**:
  - [ ] Les URLs vers `/api/*` sont `https://api.kaolackcommune.sn/api/*`
  - [ ] Status code: 200 (pas 301/302/401/403/500)
  - [ ] Pas d'erreur CORS dans Console

### Test Base de Données

**Si backend sur cPanel/Render**:

```bash
# Depuis SSH ou Terminal cPanel:
mysql -h localhost -u kaolack_user -p kaolack_db

# Ou si DB externe:
mysql -h db-host.example.com -u user -p db_name
```

- [ ] Connexion réussie (pas d'erreur de auth)
- [ ] Tables créées (migrations exécutées)

---

## 📊 CONFIGURATION FINALE

### Base de Données MySQL (cPanel)

- [ ] **cPanel → MySQL Databases**:
  - [ ] **Database**: Créé (ex: `lws1234567_kaolack`)
  - [ ] **User**: Créé (ex: `lws1234567_kaolack_user`)
  - [ ] **Permissions**: All Privileges donné
  - [ ] **Test**: Connexion locale/distante OK

### Email (Optionnel)

- [ ] **SMTP Configuré** (si notifications activées):
  - [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` valides
  - [ ] `SMTP_FROM`: `noreply@kaolackcommune.sn`

### Backups (cPanel)

- [ ] **Activer Backups Automatiques**:
  - [ ] cPanel → **Backup Wizard** (ou Backups)
  - [ ] Configurer sauvegarde quotidienne/hebdomadaire
- [ ] **Télécharger Backup Initial**:
  - [ ] Sauvegarde locale du compte complet

---

## ✨ POST-DÉPLOIEMENT

### Monitoring & Alertes

- [ ] **Monitoring Frontend**: Google Analytics/Sentry (optionnel)
- [ ] **Monitoring API**: Uptime monitoring (Pingdom, UptimeRobot)
- [ ] **Alertes Email**: Configurées si erreurs

### Documentation & Support

- [ ] **Lire**: `DEPLOYMENT_CPANEL.md` (complet)
- [ ] **Lire**: `QUICKSTART_CPANEL.md` (référence rapide)
- [ ] **Support LWS**: https://support.lws.fr/

### Accès & Credentials

- [ ] **Sauvegarder Credentials**:
  - [ ] cPanel Username/Password
  - [ ] DB User/Password
  - [ ] JWT_SECRET, SESSION_SECRET (copie sécurisée)
  - [ ] Render (ou autre provider) API Keys
- [ ] **Gestion des accès**:
  - [ ] 2FA activée sur GitHub (optionnel mais recommandé)
  - [ ] Accès cPanel limité si possible (créer sous-utilisateurs)

---

## 🎉 Déploiement Complété !

### URLs de Vérification

- ✅ **Frontend**: https://105ans.kaolackcommune.sn
- ✅ **API Health**: https://api.kaolackcommune.sn/api/health
- ✅ **GitHub Repo**: https://github.com/Quantumdigit221/kaolack-105-ans

### Prochaines Étapes (Optionnel)

1. **Créer du contenu** de démonstration (posts, utilisateurs)
2. **Configurer domaine principal** `kaolackcommune.sn` (site institutionnel)
3. **Setup Analytics** (Google Analytics)
4. **Setup Error Tracking** (Sentry)
5. **SEO Configuration** (meta tags, robots.txt, sitemap)
6. **Email Notifications** (transactional emails)

---

## 🆘 Problèmes?

| Problème | Solution |
|----------|----------|
| 404 sur frontend | Vérifier structure `/105ans.kaolackcommune.sn/` |
| CORS Error | Backend doit avoir `CORS_ORIGIN=https://105ans.kaolackcommune.sn` |
| API Timeout | Vérifier que backend est en ligne (Render logs, ou cPanel logs) |
| SSL Error | cPanel → AutoSSL → Run Now |
| DB Connection Refused | Vérifier credentials, host, et permissions |

👉 **Voir**: `DEPLOYMENT_CPANEL.md` → **Troubleshooting** (section complète)

---

**✅ Checklist complétée = Déploiement Production Ready!** 🚀

