# 🚀 Mise à jour VPS - Kaolack 105 Ans

## 📋 Étapes rapides

### 1️⃣ Connexion au VPS
```bash
ssh root@votre-ip-vps
```

### 2️⃣ Télécharger et exécuter le script de mise à jour
```bash
# Télécharger le script
wget https://raw.githubusercontent.com/Quantumdigit221/kaolack-105-ans/fix/backend-errors/update-vps.sh

# Rendre exécutable
chmod +x update-vps.sh

# Exécuter la mise à jour
sudo ./update-vps.sh
```

### 3️⃣ Vérification
```bash
# Vérifier le statut des services
pm2 status
pm2 logs kaolack-backend

# Vérifier le site
curl http://portail.kaolackcommune.sn
curl http://localhost:3003/api/health
```

---

## 🔄 Ce que fait le script

### ✅ Sauvegarde automatique
- Base de données MySQL
- Fichiers du projet
- Conservation des 5 dernières sauvegardes

### ✅ Mise à jour du code
- Pull des dernières modifications (branche `fix/backend-errors`)
- Mise à jour des dépendances backend
- Build du frontend React

### ✅ Redémarrage des services
- Backend via PM2
- Nginx (reverse proxy)
- Vérification automatique

---

## 📦 Modifications incluses dans cette mise à jour

### 🔐 Sécurité & Authentification
- **Correction JWT** : Gestion des rôles correcte
- **Authentification admin** : Vérification depuis la base de données
- **Inscription sécurisée** : Respect des rôles spécifiés

### 🎛️ Administration
- **Bouton d'approbation** : Interface complète pour gérer les posts
- **Gestion des statuts** : pending → published/blocked/archived
- **Suppression améliorée** : Cascade delete (likes, commentaires)

### 📊 Posts & Contenu
- **Statut par défaut** : Les nouveaux posts sont 'pending'
- **Validation admin** : Approbation requise avant publication
- **Messages enrichis** : Feedback utilisateur amélioré

---

## 🛠️ Commandes manuelles (si nécessaire)

### Si le script échoue :
```bash
# Mise à jour manuelle
cd /var/www/kaolack
git fetch origin
git checkout fix/backend-errors
git pull origin fix/backend-errors

# Backend
cd backend
npm ci --production
pm2 restart kaolack-backend

# Frontend
cd ..
npm ci
npm run build

# Nginx
systemctl reload nginx
```

### Vérifier les logs :
```bash
# Logs PM2
pm2 logs kaolack-backend --lines 50

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs système
journalctl -u nginx -f
```

---

## 🎯 Points de vérification post-déploiement

### ✅ Frontend
- [ ] Le site charge sur http://portail.kaolackcommune.sn
- [ ] Les pages s'affichent correctement
- [ ] Les images se chargent

### ✅ Backend
- [ ] API répond sur http://localhost:3003
- [ ] Endpoint `/api/health` fonctionne
- [ ] Les requêtes API fonctionnent

### ✅ Fonctionnalités
- [ ] Création de compte fonctionne
- [ ] Connexion admin fonctionne
- [ ] Bouton d'approbation des posts visible
- [ ] Suppression de posts fonctionne

---

## 🚨 En cas de problème

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

### Support :
- Vérifier les logs PM2 : `pm2 logs`
- Redémarrer services : `pm2 restart all && systemctl restart nginx`
- Vérifier l'espace disque : `df -h`
