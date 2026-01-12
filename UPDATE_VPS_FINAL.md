# 🚀 Mise à jour VPS - Kaolack 105 Ans

## 📋 Instructions de mise à jour

### 1️⃣ Connexion au VPS
```bash
ssh root@votre-ip-vps
```

### 2️⃣ Télécharger et exécuter le script de mise à jour
```bash
# Télécharger le script
wget https://raw.githubusercontent.com/Quantumdigit221/kaolack-105-ans/fix/backend-errors/update-vps-final.sh

# Rendre exécutable
chmod +x update-vps-final.sh

# Exécuter la mise à jour
sudo ./update-vps-final.sh
```

### 3️⃣ Vérification du déploiement
```bash
# Vérifier le statut des services
pm2 status
pm2 logs kaolack-backend

# Vérifier le site
curl http://portail.kaolackcommune.sn
curl http://localhost:3001/api/health

# Vérifier les fichiers
ls -la /var/www/kaolack
```

---

## 🔄 Ce que fait le script

### ✅ Sauvegarde automatique
- Base de données MySQL complète
- Fichiers du projet
- Conservation des 5 dernières sauvegardes

### ✅ Mise à jour du code
- Pull des dernières modifications (branche `fix/backend-errors`)
- Mise à jour des dépendances backend
- Build du frontend React

### ✅ Redémarrage des services
- Backend via PM2 (port 3001)
- Nginx (reverse proxy)
- Vérification automatique

---

## 📦 Modifications incluses dans cette mise à jour

### 🎨 Personnalités
- **Correction de l'affichage** : Les personnalités créées s'affichent maintenant
- **Propositions visibles** : Les nouvelles propositions apparaissent immédiatement
- **Filtrage amélioré** : Séparation entre personnalités approuvées et propositions

### 🎛️ Administration
- **Bouton d'approbation** : Interface complète pour gérer les posts
- **Gestion des statuts** : pending → published/blocked/archived
- **Suppression améliorée** : Cascade delete (likes, commentaires)

### 🔐 Sécurité & Authentification
- **Correction JWT** : Gestion des rôles correcte
- **Authentification admin** : Vérification depuis la base de données
- **Inscription sécurisée** : Respect des rôles spécifiés

### 📊 Posts & Contenu
- **Statut par défaut** : Les nouveaux posts sont 'pending'
- **Validation admin** : Approbation requise avant publication
- **Messages enrichis** : Feedback utilisateur amélioré

---

## 🛠️ Configuration VPS

### Variables importantes
- **Backend Port**: 3001 (standard pour VPS)
- **Frontend Port**: 80 (Nginx)
- **Domaine**: portail.kaolackcommune.sn
- **Branche**: fix/backend-errors

### Services gérés
- **Backend**: Node.js + PM2
- **Frontend**: Build statique servi par Nginx
- **Base de données**: MySQL
- **Proxy**: Nginx reverse proxy

---

## 🎯 Points de vérification post-déploiement

### ✅ Frontend
- [ ] Le site charge sur http://portail.kaolackcommune.sn
- [ ] Les pages s'affichent correctement
- [ ] Les images se chargent
- [ ] La création de personnalités fonctionne

### ✅ Backend
- [ ] API répond sur http://localhost:3001
- [ ] Endpoint `/api/health` fonctionne
- [ ] Les requêtes API fonctionnent

### ✅ Fonctionnalités
- [ ] Création de compte fonctionne
- [ ] Connexion admin fonctionne
- [ ] Bouton d'approbation des posts visible
- [ ] Suppression de posts fonctionne
- [ ] Personnalités créées s'affichent

---

## 🚨 En cas de problème

### Vérifier les logs :
```bash
# Logs PM2
pm2 logs kaolack-backend --lines 50

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs système
journalctl -u nginx -f
```

### Redémarrer manuellement :
```bash
# Backend
cd /var/www/kaolack/backend
pm2 restart kaolack-backend

# Nginx
systemctl restart nginx
```

### Rollback rapide :
```bash
# Restaurer la dernière sauvegarde
cd /var/backups/kaolack
LATEST_DB=$(ls -t *.sql | head -1)
LATEST_FILES=$(ls -t *.tar.gz | head -1)

mysql kaolack_stories < $LATEST_DB
cd /var/www/kaolack
rm -rf *
tar -xzf /var/backups/kaolack/$LATEST_FILES -C .
pm2 restart kaolack-backend
```

### Vérification manuelle du chemin :
```bash
# Vérifier que le projet est bien dans /var/www/kaolack
ls -la /var/www/kaolack
pwd  # devrait afficher /var/www/kaolack

# Si le projet est ailleurs, déplacer-le :
# mv /ancien/chemin/kaolack-105-ans/* /var/www/kaolack/
```

---

## 📈 Statut du déploiement

**Dernier commit**: `33d8663`  
**Branche**: `fix/backend-errors`  
**Statut**: ✅ Production Ready

**Corrections majeures**:
- ✅ Affichage des personnalités créées
- ✅ Bouton d'approbation admin
- ✅ Suppression améliorée des posts
- ✅ Gestion JWT corrigée
- ✅ Port backend standardisé (3001)

**Le VPS est prêt à être mis à jour !** 🚀
