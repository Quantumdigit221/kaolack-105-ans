# 🚀 Guide de Déploiement VPS - Kaolack 105 Ans

## Déploiement Automatique (Recommandé)

### Étape 1 : Connexion au VPS
```bash
ssh root@votre-ip-vps
# ou
ssh utilisateur@votre-ip-vps
```

### Étape 2 : Téléchargement et exécution du script
```bash
# Cloner le repository
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git
cd kaolack-105-ans

# Rendre le script exécutable
chmod +x deploy-vps.sh

# Exécuter le script de déploiement (avec sudo)
sudo ./deploy-vps.sh
```

Le script va automatiquement :
- ✅ Vérifier et installer les prérequis (Node.js, MySQL, Nginx, PM2)
- ✅ Créer les répertoires nécessaires
- ✅ Cloner/mettre à jour le code source
- ✅ Configurer la base de données MySQL
- ✅ Créer les fichiers .env
- ✅ Installer les dépendances (frontend + backend)
- ✅ Builder le frontend React
- ✅ Exécuter les migrations de base de données
- ✅ Configurer PM2 pour le backend
- ✅ Configurer Nginx comme reverse proxy
- ✅ Configurer le firewall
- ✅ Tester le déploiement

### Étape 3 : Configuration post-déploiement

#### 3.1 Modifier les variables d'environnement
```bash
nano /var/www/kaolack/.env
```

**Variables importantes à modifier :**
- `DB_PASSWORD` : Mot de passe MySQL sécurisé
- `JWT_SECRET` : Clé secrète JWT (générée automatiquement)
- `SESSION_SECRET` : Clé secrète de session (générée automatiquement)
- `GOOGLE_GEMINI_API_KEY` : Clé API Google Gemini (optionnel, pour le bot)

#### 3.2 Configurer SSL/HTTPS
```bash
# Installer Certbot si pas déjà fait
sudo apt-get install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d portail.kaolackcommune.sn

# Tester le renouvellement automatique
sudo certbot renew --dry-run
```

#### 3.3 Vérifier que le domaine pointe vers le VPS
Assurez-vous que le DNS du domaine `portail.kaolackcommune.sn` pointe vers l'IP de votre VPS.

### Étape 4 : Vérification

```bash
# Vérifier le statut PM2
pm2 status

# Vérifier les logs backend
pm2 logs kaolack-backend

# Vérifier Nginx
sudo systemctl status nginx

# Tester l'API
curl http://localhost:3003/api/health

# Tester le frontend
curl http://localhost/
```

## Commandes Utiles

### Gestion PM2
```bash
# Voir les logs
pm2 logs kaolack-backend

# Redémarrer
pm2 restart kaolack-backend

# Arrêter
pm2 stop kaolack-backend

# Status
pm2 status

# Monitoring
pm2 monit
```

### Gestion Nginx
```bash
# Tester la configuration
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Redémarrer
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/kaolack_access.log
sudo tail -f /var/log/nginx/kaolack_error.log
```

### Mise à jour de l'application
```bash
cd /var/www/kaolack

# Sauvegarder la base de données
mysqldump -u kaolack_user -p kaolack_stories > backup_$(date +%Y%m%d_%H%M%S).sql

# Mettre à jour le code
git pull origin fix/backend-errors

# Réinstaller les dépendances si nécessaire
npm install --production
cd backend && npm install --production && cd ..

# Rebuild le frontend
npm run build

# Exécuter les migrations
cd backend
npx sequelize-cli db:migrate
cd ..

# Redémarrer le backend
pm2 restart kaolack-backend
```

## Structure des Répertoires

```
/var/www/kaolack/
├── backend/          # Code backend Node.js
├── src/              # Code source frontend React
├── dist/             # Build frontend (généré)
├── uploads/          # Fichiers uploadés
├── logs/             # Logs application
├── .env              # Variables d'environnement
├── ecosystem.config.cjs  # Configuration PM2
└── package.json      # Dépendances frontend
```

## Dépannage

### Backend ne démarre pas
```bash
# Vérifier les logs
pm2 logs kaolack-backend

# Vérifier la configuration .env
cat /var/www/kaolack/.env

# Vérifier la connexion MySQL
mysql -u kaolack_user -p -e "SHOW DATABASES;"
```

### Frontend ne s'affiche pas
```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les permissions
ls -la /var/www/kaolack/dist/

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/kaolack_error.log
```

### Problèmes de base de données
```bash
# Se connecter à MySQL
mysql -u kaolack_user -p kaolack_stories

# Vérifier les tables
SHOW TABLES;

# Vérifier les migrations
cd /var/www/kaolack/backend
npx sequelize-cli db:migrate:status
```

## Configuration Recommandée

### Spécifications VPS minimales
- **RAM** : 2GB (4GB recommandé)
- **CPU** : 2 cœurs
- **Stockage** : 20GB (50GB recommandé)
- **OS** : Ubuntu 20.04+ / Debian 11+

### Ports à ouvrir
- **22** : SSH
- **80** : HTTP
- **443** : HTTPS

## Support

- **Repository** : https://github.com/Quantumdigit221/kaolack-105-ans
- **Branche de déploiement** : `fix/backend-errors`

## Checklist de Déploiement

- [ ] VPS configuré avec les spécifications minimales
- [ ] Domaine pointant vers l'IP du VPS
- [ ] Script de déploiement exécuté avec succès
- [ ] Variables d'environnement configurées
- [ ] SSL/HTTPS configuré (Let's Encrypt)
- [ ] Base de données initialisée
- [ ] Migrations exécutées
- [ ] Backend démarré avec PM2
- [ ] Frontend accessible via Nginx
- [ ] Tests de fonctionnement OK

**🎉 Une fois cette checklist complétée, votre application est déployée !**
