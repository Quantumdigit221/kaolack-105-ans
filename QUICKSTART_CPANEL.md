# ⚡ Quick Start - cPanel Deployment (5 minutes)

**Domaine**: `portail.kaolackcommune.sn`  
**Plateforme**: cPanel LWS  
**Temps**: ~5 minutes

---

## 🎯 Résumé en 4 étapes

### 1️⃣ Uploader le frontend (2 min)

```bash
# Fichiers nécessaires:
# - dist-cpanel.zip (fourni)

# Actions cPanel:
# 1. Login: https://lws-hosting.com:2083
# 2. File Manager > Créer dossier: public_html/portail.kaolackcommune.sn/
# 3. Upload dist-cpanel.zip
# 4. Extraire l'archive
# 5. Vérifier: ouvrir http://portail.kaolackcommune.sn dans navigateur
```

### 2️⃣ Créer la base de données MySQL (1 min)

```bash
# Actions cPanel:
# 1. MySQL Databases > Create Database
#    - Nom: u123456789_kaolack (ou votre préfixe)
# 2. MySQL Users > Create User
#    - User: u123456789_kaolack
#    - Password: (générer forte)
# 3. Add User to Database > ALL PRIVILEGES
# 4. Noter les credentials
```

### 3️⃣ Déployer le backend (1 min)

**Option A: cPanel Node.js Manager (si disponible)**

```bash
# 1. SSH vers serveur ou utiliser cPanel Terminal
ssh utilisateur@lws-hosting.com

# 2. Cloner et configurer
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git
cd kaolack-105-ans/backend
npm install

# 3. Configurer backend/.env:
nano .env
# Éditer: DB_HOST, DB_USER, DB_PASSWORD, CORS_ORIGIN

# 4. cPanel > Setup Node.js App > Create Application
#    - Application root: ~/kaolack-105-ans/backend
#    - Application URL: https://api.kaolackcommune.sn
#    - Startup File: server.js
```

**Option B: Render (backend externe)**

```bash
# 1. Aller sur https://render.com
# 2. Connecter repo GitHub
# 3. Créer Web Service:
#    - Build: npm --prefix backend install
#    - Start: npm --prefix backend start
#    - Environment: ajouter variables .env.production
# 4. Render génère URL (ex: kaolack-api.onrender.com)
# 5. cPanel > Zone Editor > Ajouter CNAME api -> URL Render
```

### 4️⃣ Vérifier (1 min)

```bash
# Frontend
curl http://portail.kaolackcommune.sn

# API Health
curl https://api.kaolackcommune.sn/api/health

# Réponse attendue:
# {"status":"OK","message":"Kaolack Stories Connect API",...}
```

---

## ✅ Checklist rapide

- [ ] dist-cpanel.zip uploadé et extrait sur cPanel
- [ ] Frontend accessible: `http://portail.kaolackcommune.sn`
- [ ] Base MySQL créée (u123456789_kaolack)
- [ ] Utilisateur MySQL créé et autorisé
- [ ] Backend configuré (.env.production rempli)
- [ ] Backend déployé (cPanel Node.js ou Render)
- [ ] API accessible: `https://api.kaolackcommune.sn/api/health`
- [ ] CORS configuré (CORS_ORIGIN = http://portail.kaolackcommune.sn)

---

## 📁 Fichiers clés

| Fichier | Description |
|---------|-------------|
| `dist-cpanel.zip` | Frontend build (à uploader sur cPanel) |
| `backend/.env.production` | Config backend (à éditer avec DB credentials) |
| `.env.cpanel.example` | Template (référence) |
| `DEPLOYMENT_CPANEL.md` | Guide complet (si besoin d'aide) |

---

## 🚀 Commandes clés

```bash
# Build local (déjà fait)
npm run build

# Zip local (déjà fait)
Compress-Archive -Path .\dist\* -DestinationPath .\dist-cpanel.zip

# SSH cPanel
ssh utilisateur@lws-hosting.com

# Installer backend deps (SSH)
npm --prefix backend install

# Configurer backend
nano backend/.env.production

# Tester API
curl https://api.kaolackcommune.sn/api/health
```

---

## 🔗 URLs après déploiement

```
Frontend:  http://portail.kaolackcommune.sn
API:       https://api.kaolackcommune.sn/api
Health:    https://api.kaolackcommune.sn/api/health
```

---

## 🆘 Aide rapide

### Frontend blanc
→ Vérifier que `index.html` est à la racine du dossier  
→ Vérifier les logs du navigateur (F12 > Console)

### API ne répond pas
→ Vérifier le statut Node.js dans cPanel  
→ Vérifier que `backend/.env` est correct  
→ Tester: `curl https://api.kaolackcommune.sn/api/health`

### Erreur CORS
→ Éditer `backend/.env.production`  
→ S'assurer que `CORS_ORIGIN=http://portail.kaolackcommune.sn`  
→ Redémarrer le backend

### Plus d'aide?
→ Voir `DEPLOYMENT_CPANEL.md` (guide complet)

---

## 📞 Support

- **LWS Support**: https://support.lws.fr/
- **GitHub Issues**: https://github.com/Quantumdigit221/kaolack-105-ans/issues

---

**C'est prêt! 🎉**

Procédez étape par étape et vous aurez votre application en production en 5 minutes.
