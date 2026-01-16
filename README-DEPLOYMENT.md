# 📋 Guide de Déploiement VPS - Kaolack 105 Ans

## 🚀 Mise à jour du VPS

### Prérequis
- Accès SSH au VPS
- Node.js installé sur le VPS
- MySQL configuré
- Nginx configuré

### Étapes du déploiement

#### 1. Configuration du script
```bash
# L'IP VPS est déjà configurée : 51.68.70.83
# Vous pouvez vérifier/modifier si nécessaire :
nano deploy-update.sh
```

#### 2. Lancement du déploiement
```bash
# Rendre le script exécutable
chmod +x deploy-update.sh

# Lancer le déploiement
./deploy-update.sh
```

### 🔧 Modifications apportées dans cette mise à jour

#### Frontend
- ✅ Séparation claire entre Actualités et Publications
- ✅ Nouvelles catégories pour annonces officielles
- ✅ Interface admin optimisée
- ✅ Correction des erreurs d'affichage

#### Backend
- ✅ Correction des erreurs 500 sur `/api/news/admin/all`
- ✅ Modèle News correctement configuré
- ✅ Routes optimisées
- ✅ Gestion améliorée des catégories

#### Base de données
- ✅ Structure maintenue
- ✅ Sauvegarde automatique avant mise à jour
- ✅ Compatibilité préservée

### 📁 Structure des fichiers

```
kaolack-105-ans/
├── src/
│   ├── components/admin/
│   │   ├── NewsManagement.tsx     # Gestion des annonces officielles
│   │   └── PostsManagement.tsx    # Gestion des publications citoyennes
│   ├── pages/
│   │   ├── Admin.tsx              # Interface admin mise à jour
│   │   ├── Actualites.tsx         # Page des actualités publiques
│   │   └── Feed.tsx               # Page des publications
│   └── services/
│       └── api.ts                 # Services API
├── backend/
│   ├── models/
│   │   └── news.js                # Modèle News corrigé
│   ├── routes/
│   │   └── news.js                # Routes actualités optimisées
│   └── server.js                  # Serveur backend
├── deploy-update.sh               # Script de déploiement
└── README-DEPLOYMENT.md           # Ce guide
```

### 🎯 Catégories clarifiées

#### Annonces Officielles (Actualités)
- Annonce officielle
- Communiqué municipal  
- Événement officiel
- Service public
- Projet municipal
- Information citoyen

#### Publications Citoyennes
- Témoignages
- Expériences
- Suggestions
- Actualités citoyennes

### 🔍 Vérification post-déploiement

#### 1. Vérifier l'API
```bash
curl https://portail.kaolackcommune.sn/api/health
```

#### 2. Vérifier le frontend
- Accéder à `https://portail.kaolackcommune.sn`
- Vérifier que la page s'affiche correctement

#### 3. Vérifier l'admin
- Se connecter à l'interface admin
- Vérifier les onglets "Annonces Officielles" et "Publications"
- Tester la création de contenu

### 🚨 Dépannage

#### Erreur 500 sur les actualités
```bash
# Vérifier les logs du backend
ssh root@51.68.70.83
tail -f /var/www/kaolack/backend/backend.log
```

#### Problèmes de permissions
```bash
# Corriger les permissions
ssh root@51.68.70.83
chown -R www-data:www-data /var/www/kaolack
chmod -R 755 /var/www/kaolack
```

#### Redémarrage manuel des services
```bash
# Redémarrer le backend
ssh root@51.68.70.83
cd /var/www/kaolack/backend
pkill -f "node server.js"
nohup node server.js > backend.log 2>&1 &

# Redémarrer Nginx
systemctl reload nginx
```

### 📞 Support

En cas de problème :
1. Vérifier les logs du backend
2. Vérifier les logs Nginx
3. S'assurer que la base de données est accessible
4. Vérifier les permissions des fichiers

### 🔐 Configuration SSL/HTTPS

Pour configurer le certificat SSL :
```bash
# Rendre le script exécutable
chmod +x ssl-setup.sh

# Lancer la configuration SSL
./ssl-setup.sh
```

### 🔄 Mises à jour futures

Pour les prochaines mises à jour :
1. Effectuer les modifications localement
2. Tester en environnement de développement
3. Lancer le script `deploy-update.sh`
4. Vérifier le déploiement

### 📋 Configuration finale

Après déploiement :
- ✅ **IP VPS** : 51.68.70.83
- ✅ **Domaine** : portail.kaolackcommune.sn
- ✅ **HTTPS** : Configuré avec ssl-setup.sh
- ✅ **Automatisation** : Renouvellement SSL automatique

---

**Note importante :** Les scripts sont préconfigurés avec votre IP VPS (51.68.70.83) et votre domaine (portail.kaolackcommune.sn) !
