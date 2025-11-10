# 🚂 Guide de déploiement Railway - 105 ans de Kaolack

## 📋 Étapes détaillées

### 1. Préparation du repository GitHub

1. **Créer un repository GitHub** (si pas déjà fait)
   ```bash
   git init
   git add .
   git commit -m "Initial commit - 105 ans de Kaolack"
   git branch -M main
   git remote add origin https://github.com/VOTRE-USERNAME/kaolack-105.git
   git push -u origin main
   ```

### 2. Inscription Railway

1. Aller sur https://railway.app
2. Cliquer "Login with GitHub"
3. Autoriser Railway à accéder à vos repos

### 3. Déploiement Backend + Database

1. **Nouveau projet Railway**
   - Cliquer "New Project"
   - Sélectionner "Deploy from GitHub repo"
   - Choisir votre repository

2. **Ajouter base de données MySQL**
   - Dans le projet, cliquer "New Service"
   - Sélectionner "Database" → "MySQL"
   - Railway créera automatiquement la DB

3. **Configuration variables d'environnement**
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=votre_secret_jwt_tres_secure_ici
   FRONTEND_URL=${{RAILWAY_STATIC_URL}}
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   BCRYPT_ROUNDS=12
   SESSION_EXPIRY=86400
   ```

4. **Configuration du build**
   - Railway détecte automatiquement Node.js
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

### 4. Configuration Frontend

1. **Variables d'environnement frontend**
   ```
   VITE_API_URL=https://votre-backend.railway.app/api
   ```

2. **Build settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 5. Migration base de données

1. **Connexion à la DB Railway**
   - Utiliser les credentials fournis par Railway
   - Importer votre schéma MySQL existant

2. **Import des données**
   ```sql
   -- Exporter vos données locales
   mysqldump -u root kaolack_stories > backup.sql
   
   -- Importer dans Railway (utiliser Railway CLI ou phpMyAdmin)
   ```

### 6. Test et déploiement

1. **Vérifier les logs Railway**
2. **Tester l'API**: `https://votre-app.railway.app/api/health`
3. **Tester le frontend**: `https://votre-app.railway.app`
4. **Installer PWA** depuis l'URL de production

## 💰 Coûts Railway (Gratuit)

- **$5 de crédit gratuit/mois**
- **Votre app consommera environ $2-3/mois**
- **Largement dans la limite gratuite**

## 🔄 Déploiement automatique

Une fois configuré, chaque `git push` déploiera automatiquement !

## 🆘 Support

Si besoin d'aide, Railway a une excellente documentation et communauté Discord.