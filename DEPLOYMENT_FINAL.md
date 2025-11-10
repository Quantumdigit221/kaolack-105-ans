# 🎯 DÉPLOIEMENT GRATUIT COMPLET - 105 ans de Kaolack

## ✅ FICHIERS PRÉPARÉS POUR VOUS :

- ✅ `kaolack_105_export.sql` (43KB) - Vos données exportées
- ✅ `Dockerfile` - Configuration Docker
- ✅ `railway.json` - Configuration Railway  
- ✅ `vercel.json` - Configuration Vercel (alternative)
- ✅ `.env.railway` - Variables d'environnement exemple
- ✅ Scripts de build optimisés

## 🚂 OPTION 1: RAILWAY (RECOMMANDÉE - PLUS SIMPLE)

### Coût: $5 crédit gratuit/mois (votre app = ~$2/mois)

### Étapes:
1. **Compte GitHub** 
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Railway.app**
   - Se connecter avec GitHub
   - "New Project" → "Deploy from GitHub repo"
   - Sélectionner votre repository

3. **Ajouter MySQL Database**
   - Dans Railway: "New Service" → "Database" → "MySQL"

4. **Variables d'environnement** (copier dans Railway Dashboard):
   ```
   NODE_ENV=production
   JWT_SECRET=votre_secret_jwt_super_secure_ici
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   FRONTEND_URL=${{RAILWAY_STATIC_URL}}
   PORT=3001
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

5. **Importer données**
   - Utiliser phpMyAdmin ou MySQL client
   - Importer `kaolack_105_export.sql`

6. **Déploiement automatique** ✅

---

## 🔄 OPTION 2: VERCEL + PLANETSCALE

### Coût: 100% Gratuit

### Frontend (Vercel):
1. https://vercel.com → Connect GitHub
2. Deploy votre repo
3. Variables: `VITE_API_URL=https://votre-api.vercel.app/api`

### Base de données (PlanetScale):
1. https://planetscale.com → Compte gratuit
2. Créer database MySQL
3. Importer `kaolack_105_export.sql`

### Backend (Vercel Serverless):
- Nécessite adaptation du code Express → Serverless Functions
- Plus complexe mais 100% gratuit

---

## 🎯 RECOMMANDATION FINALE

**CHOISISSEZ RAILWAY** pour votre première fois:
- ✅ Zéro modification de code nécessaire
- ✅ MySQL supporté nativement  
- ✅ Déploiement en 5 minutes
- ✅ PWA fonctionne parfaitement
- ✅ Logo "105 ans de Kaolack" préservé
- ✅ $5 crédit gratuit largement suffisant

## 🚀 APRÈS DÉPLOIEMENT

Votre PWA "105 ans de Kaolack" sera accessible:
- **URL**: https://votre-app.railway.app
- **Installable** sur mobile et desktop
- **Icône**: Logo "105 ans de Kaolack" 
- **Fonctionnalités**: 100% identiques au local

## 📞 SUPPORT

Si besoin d'aide pour le déploiement, la documentation Railway est excellente et leur Discord très réactif.