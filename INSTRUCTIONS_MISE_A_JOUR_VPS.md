# Instructions de Mise à Jour VPS - Kaolack 105 ANS

## 🚀 Mise à jour rapide (recommandé)

### Option 1: Exécution directe sur le VPS

1. **Connectez-vous au VPS** :
   ```bash
   ssh ubuntu@51.68.70.83
   ```

2. **Téléchargez le script de mise à jour** :
   ```bash
   cd /tmp
   wget https://raw.githubusercontent.com/Quantumdigit221/kaolack-105-ans/main/vps-update-quick.sh
   chmod +x vps-update-quick.sh
   ```

3. **Exécutez la mise à jour** :
   ```bash
   sudo ./vps-update-quick.sh
   ```

### Option 2: Mise à jour manuelle

1. **Connectez-vous au VPS** :
   ```bash
   ssh ubuntu@51.68.70.83
   ```

2. **Allez dans le répertoire du projet** :
   ```bash
   cd /var/www/kaolack
   ```

3. **Mettez à jour le code** :
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

4. **Installez les dépendances backend** :
   ```bash
   cd backend
   npm ci --production
   ```

5. **Build le frontend** :
   ```bash
   cd ..
   npm ci
   npm run build
   ```

6. **Redémarrez les services** :
   ```bash
   cd backend
   pm2 restart kaolack-backend
   sudo systemctl reload nginx
   ```

## 📋 Vérification après mise à jour

1. **Vérifiez le statut des services** :
   ```bash
   pm2 status
   sudo systemctl status nginx
   ```

2. **Vérifiez les logs si nécessaire** :
   ```bash
   pm2 logs kaolack-backend
   sudo tail -f /var/log/nginx/kaolack_access.log
   ```

3. **Testez l'API** :
   ```bash
   curl https://portail.kaolackcommune.sn/api/health
   ```

4. **Vérifiez le site** :
   - Allez sur https://portail.kaolackcommune.sn
   - Vérifiez que toutes les fonctionnalités fonctionnent

## 🔧 En cas de problème

1. **Vérifiez les logs** :
   ```bash
   pm2 logs kaolack-backend --lines 50
   sudo journalctl -u nginx -f
   ```

2. **Redémarrez les services** :
   ```bash
   pm2 restart kaolack-backend
   sudo systemctl restart nginx
   ```

3. **Vérifiez la base de données** :
   ```bash
   mysql -u root -p kaolack_stories
   ```

## 📦 Sauvegardes

Les sauvegardes sont créées automatiquement dans `/var/backups/kaolack/` :
- Base de données : `db_backup_YYYYMMDD_HHMMSS.sql`
- Fichiers : `files_backup_YYYYMMDD_HHMMSS.tar.gz`

Pour restaurer une sauvegarde en cas de problème :
```bash
# Base de données
mysql -u root -p kaolack_stories < /var/backups/kaolack/db_backup_YYYYMMDD_HHMMSS.sql

# Fichiers
cd /var/www
tar -xzf /var/backups/kaolack/files_backup_YYYYMMDD_HHMMSS.tar.gz
```

## 🌐 Configuration

- **Domaine** : portail.kaolackcommune.sn
- **IP VPS** : 51.68.70.83
- **Port Backend** : 3003
- **Port Frontend** : 80/443
- **Répertoire** : /var/www/kaolack

## ⚠️ Notes importantes

- Toujours exécuter les scripts avec `sudo`
- Vérifier que la branche `main` est bien utilisée
- Les sauvegardes sont automatiques lors de chaque mise à jour
- En cas d'erreur, vérifiez les logs avant de redémarrer
- Assurez-vous que le domaine pointe bien vers l'IP du VPS

## 🔄 Mise à jour SSL

Si SSL n'est pas configuré :
```bash
sudo certbot --nginx -d portail.kaolackcommune.sn
```
