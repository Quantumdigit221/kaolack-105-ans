# 📤 GUIDE: Déployer sur GitHub

## Étape 1: Créer un repository GitHub

1. **Allez sur GitHub**
   - https://github.com/new
   - Connectez-vous à votre compte (créez un compte si nécessaire)

2. **Créer un nouveau repository**
   - **Repository name**: `kaolack-105-ans` (ou votre choix)
   - **Description**: "PWA 105 ans de Kaolack - React + Express + MySQL + Logo"
   - **Public** (pour pouvoir le déployer sur Railway)
   - ❌ Ne cochez pas "Initialize this repository"
   - Cliquez **"Create repository"**

3. **Vous verrez les instructions**
   - GitHub vous affiche exactement quoi faire
   - Gardez cette page ouverte

## Étape 2: Connecter votre repository local à GitHub

Exécutez ces commandes (remplacez `YOUR_USERNAME` par votre username GitHub) :

```powershell
# Ajouter GitHub comme remote
git remote add origin https://github.com/YOUR_USERNAME/kaolack-105-ans.git

# Renommer la branche en "main"
git branch -M main

# Pusher vers GitHub
git push -u origin main
```

## Étape 3: Vérifier sur GitHub

1. Rafraîchissez la page GitHub
2. Vous devriez voir vos fichiers apparaître
3. Cliquez sur "README" (ou créez-en un)

## Étape 4: Copier l'URL de votre repository

L'URL sera: `https://github.com/YOUR_USERNAME/kaolack-105-ans`

## ✅ C'est fait !

Votre code est maintenant sur GitHub et prêt pour:
- ✅ Déploiement sur Railway
- ✅ Collaboration avec d'autres
- ✅ Backup sécurisé
- ✅ Versioning du projet

## 🚀 Prochaine étape: Déployer sur Railway

Une fois que le repository est sur GitHub, vous pouvez:
1. Aller sur https://railway.app
2. Connecter votre compte GitHub
3. Sélectionner ce repository
4. Railway déploiera automatiquement !

---

**Note**: Si vous n'avez pas de compte GitHub:
1. https://github.com/signup
2. Confirmez votre email
3. Revenez ici et répétez les étapes