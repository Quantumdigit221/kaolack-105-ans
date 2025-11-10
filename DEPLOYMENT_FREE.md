# Guide de déploiement gratuit - 105 ans de Kaolack
# Option recommandée : Railway

## 🚂 Railway (Solution complète recommandée)

### Avantages :
- ✅ Frontend + Backend + Base de données MySQL
- ✅ $5 crédit gratuit/mois (renouvelable)
- ✅ Deploy depuis GitHub automatique
- ✅ Variables d'environnement sécurisées
- ✅ HTTPS automatique
- ✅ PWA compatible

### Étapes de déploiement :

1. **Créer compte Railway**
   - https://railway.app
   - Se connecter avec GitHub

2. **Créer nouveau projet**
   - "Deploy from GitHub repo"
   - Sélectionner votre repo

3. **Configuration automatique**
   - Railway détecte Node.js
   - Configure le build automatiquement

4. **Variables d'environnement**
   - Ajouter dans Railway Dashboard
   - JWT_SECRET, DB_PASSWORD, etc.

## 📊 Alternatives gratuites :

### Vercel + PlanetScale
- **Vercel** : Frontend React (gratuit illimité)
- **PlanetScale** : MySQL gratuit 5GB
- **Limitation** : Backend nécessite adaptation serverless

### Render
- **Frontend** : Sites statiques gratuits
- **Backend** : 750h/mois gratuit (suffisant)
- **Base de données** : PostgreSQL gratuite

### Netlify + Supabase
- **Netlify** : Frontend + Functions
- **Supabase** : Base de données PostgreSQL gratuite
- **Limitation** : Migration de MySQL vers PostgreSQL

## 🎯 Choix recommandé : Railway
Le plus simple pour votre application existante sans modifications majeures.