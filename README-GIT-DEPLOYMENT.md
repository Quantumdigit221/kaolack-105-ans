# 📋 Déploiement Git - Kaolack 105 Ans

## 🚀 Déploiement avec Git

Cette méthode utilise Git pour déployer automatiquement votre application sur le VPS.

### Prérequis

- Accès SSH au VPS (51.68.70.83)
- Git installé localement
- Droits d'administration sur le VPS

### 🔄 Workflow de déploiement

#### 1. Configuration initiale
```bash
# Lancer le script de configuration Git
./deploy-git.sh
```

#### 2. Déploiements futurs
```bash
# Ajouter les modifications
git add .

# Commiter les changements
git commit -m "Description des modifications"

# Push vers le VPS (déploiement automatique)
git push origin main
```

### 📁 Structure du déploiement Git

```
VPS (51.68.70.83)
├── /var/www/kaolack.git/     # Dépôt Git nu (bare repository)
├── /var/www/kaolack/         # Application déployée
│   ├── frontend/             # Build du frontend
│   ├── backend/              # Backend Node.js
│   └── uploads/              # Fichiers uploadés
└── /var/backups/kaolack/     # Sauvegardes automatiques
```

### 🔧 Hook post-receive

Le hook `post-receive` s'exécute automatiquement après chaque push :

1. **Sauvegarde automatique** de la base de données et des fichiers
2. **Déploiement** des nouveaux fichiers
3. **Installation** des dépendances backend
4. **Build** du frontend en production
5. **Configuration** des permissions
6. **Redémarrage** des services (Node.js + Nginx)

### 📋 Avantages du déploiement Git

- ✅ **Automatisation complète** : Un seul `git push` déploie tout
- ✅ **Sauvegardes automatiques** : Avant chaque déploiement
- ✅ **Historique des versions** : Git conserve tout l'historique
- ✅ **Rollback facile** : Retour à une version précédente
- ✅ **Déploiement rapide** : Optimisé pour la production

### 🚨 Dépannage Git

#### Erreur de connexion SSH
```bash
# Tester la connexion SSH
ssh root@51.68.70.83

# Si erreur de clé SSH
ssh-copy-id root@51.68.70.83
```

#### Erreur de permissions
```bash
# Corriger les permissions sur le VPS
ssh root@51.68.70.83
chown -R www-data:www-data /var/www/kaolack
chmod -R 755 /var/www/kaolack
```

#### Vérifier le statut du dépôt
```bash
# Sur le VPS
ssh root@51.68.70.83
cd /var/www/kaolack.git
git log --oneline -5
```

### 🔄 Workflow de développement

1. **Développement local**
   ```bash
   # Faire les modifications
   # Tester localement
   npm run dev
   ```

2. **Tests**
   ```bash
   # Tester le build
   npm run build:production
   
   # Tester l'API
   npm start
   ```

3. **Déploiement**
   ```bash
   # Commit et push
   git add .
   git commit -m "Nouvelle fonctionnalité"
   git push origin main
   ```

4. **Vérification**
   ```bash
   # Vérifier le déploiement
   curl https://portail.kaolackcommune.sn/api/health
   ```

### 📊 Monitoring

#### Logs du déploiement
```bash
# Sur le VPS
ssh root@51.68.70.83
tail -f /var/www/kaolack/backend/backend.log
```

#### Statut des services
```bash
# Vérifier PM2
ssh root@51.68.70.83 'pm2 status'

# Vérifier Nginx
ssh root@51.68.70.83 'systemctl status nginx'
```

### 🔐 Configuration SSL

Après le déploiement Git, configurez SSL :
```bash
./ssl-setup.sh
```

### 📝 Bonnes pratiques

1. **Messages de commit clairs**
   ```bash
   git commit -m "fix: correction des erreurs 500 sur les actualités"
   git commit -m "feat: ajout des nouvelles catégories d'annonces"
   ```

2. **Branches pour les fonctionnalités**
   ```bash
   git checkout -b nouvelle-fonctionnalite
   # ... développement ...
   git checkout main
   git merge nouvelle-fonctionnalite
   git push origin main
   ```

3. **Vérification avant déploiement**
   ```bash
   # Vérifier les fichiers qui seront déployés
   git status
   
   # Vérifier les derniers commits
   git log --oneline -3
   ```

---

### 🎯 Résumé

Avec le déploiement Git :
- **Un seul `git push`** déploie automatiquement
- **Sauvegardes automatiques** à chaque déploiement
- **Rollback facile** avec Git
- **Historique complet** des versions

**Le déploiement est maintenant automatisé et fiable !** 🚀
