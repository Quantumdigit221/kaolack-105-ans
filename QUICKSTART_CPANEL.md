# ⚡ Quick Start - Déploiement cPanel (5 minutes)

**Pour**: LWS Hosting cPanel  
**Domaine**: `105ans.kaolackcommune.sn`  
**Durée**: ~10-15 minutes

---

## 🎯 En 5 étapes

### 1️⃣ Préparer le build local

```powershell
# Windows PowerShell
cd c:\xampp\htdocs\kaolack-stories-connect-main

# Build frontend
npm run build

# Zipper dist/
Compress-Archive -Path .\dist\* -DestinationPath .\dist.zip
```

**Résultat**: Fichier `dist.zip` créé ✅

---

### 2️⃣ Accéder à cPanel File Manager

1. Ouvrir: `https://lws-hosting.com:2083`
2. Entrer **identifiant** + **mot de passe**
3. Cliquer **File Manager**

---

### 3️⃣ Créer le dossier et uploader

```
Dans File Manager:

1. Naviguer vers: /public_html/
2. Créer dossier: 105ans.kaolackcommune.sn
3. Entrer dans le dossier
4. Uploader: dist.zip
5. Click droit → Extract
6. Confirmer
```

**Résultat**: Fichiers dans `/public_html/105ans.kaolackcommune.sn/` ✅

---

### 4️⃣ Créer le sous-domaine dans cPanel

Si pas encore créé:

```
cPanel → Subdomains (ou Addon Domains)

1. Subdomain: 105ans
2. Domain: kaolackcommune.sn
3. Document Root: /public_html/105ans.kaolackcommune.sn
4. Create
```

**Résultat**: Sous-domaine créé ✅

---

### 5️⃣ Activer SSL & Vérifier

```
cPanel → AutoSSL

1. Run AutoSSL Now
2. Attendre 2-3 minutes
```

Tester dans le navigateur:
```
https://105ans.kaolackcommune.sn
```

**Résultat**: Page chargée avec HTTPS ✅

---

## ✨ C'est fait !

Votre site est en ligne sur: **https://105ans.kaolackcommune.sn** 🎉

---

## 🔌 Configuration API (Backend)

### Option A: Service Externe (Recommandée)

**Déployer sur Render** (gratuit):

1. Forker le repo: https://github.com/Quantumdigit221/kaolack-105-ans
2. Aller à: https://render.com
3. Créer **Web Service** → connecter GitHub repo
4. Ajouter variables d'environnement (du `.env.production`)
5. Deploy
6. Copier l'URL Render
7. Dans le registrar DNS, créer CNAME:
   ```
   Name: api
   Points to: <render-url>.onrender.com
   ```

Attendre la propagation DNS (5-30 min).

Tester:
```bash
curl https://api.kaolackcommune.sn/api/health
```

**Dépannage**: Consulter `DEPLOYMENT_CPANEL.md` → Troubleshooting

---

### Option B: Node.js via cPanel

Si LWS supporte Node.js (demander au support):

```bash
# SSH vers le serveur
ssh lws1234567@lws-hosting.com

# Cloner le repo
cd ~/nodejs_apps/
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git api
cd api/backend

# Installer et configurer
npm install
cp .env.example .env
nano .env  # Éditer les paramètres

# Démarrer
npm start
```

Puis dans cPanel → Setup Node.js App → créer l'application.

---

## 🧪 Test Complet

1. **Frontend**: Ouvrir https://105ans.kaolackcommune.sn
   - Page doit charger sans erreurs
2. **API Health**: 
   ```bash
   curl https://api.kaolackcommune.sn/api/health
   ```
   - Doit retourner JSON avec `"status":"OK"`
3. **DevTools (F12)**:
   - Network tab
   - Faire une action (login, charger posts)
   - Vérifier les requêtes vers `/api/*` → Status 200

---

## 🆘 Problèmes Courants

| Problème | Solution |
|----------|----------|
| **404 Not Found** | Vérifier `index.html` dans `/public_html/105ans.kaolackcommune.sn/` |
| **CORS Error** | Backend doit avoir `CORS_ORIGIN=https://105ans.kaolackcommune.sn` |
| **SSL Error** | cPanel → AutoSSL → Run AutoSSL Now |
| **API Timeout** | Vérifier que backend est en ligne (Render/cPanel) |
| **Fichiers manquants** | Réuploader `dist.zip` et extraire |

---

## 📚 Plus de détails

Pour configuration avancée, troubleshooting complet, backup, etc.:

👉 Consulter: **DEPLOYMENT_CPANEL.md**

---

**Besoin d'aide ?** Support LWS: https://support.lws.fr/

**Déploiement réussi!** 🚀
