# Correction Rapide des Permissions - VPS Kaolack

## 🚨 Problème
Erreur de build Vite : `EACCES: permission denied, rmdir '/var/www/kaolack/dist/assets'`

## 🔧 Solution rapide

### Option 1: Script de correction automatique

1. **Téléchargez et exécutez le script** :
   ```bash
   ssh ubuntu@51.68.70.83
   cd /tmp
   wget https://raw.githubusercontent.com/Quantumdigit221/kaolack-105-ans/main/fix-permissions.sh
   chmod +x fix-permissions.sh
   sudo ./fix-permissions.sh
   ```

### Option 2: Correction manuelle

1. **Connectez-vous au VPS** :
   ```bash
   ssh ubuntu@51.68.70.83
   ```

2. **Arrêtez les services** :
   ```bash
   pm2 stop kaolack-backend
   ```

3. **Corrigez les permissions** :
   ```bash
   sudo chown -R www-data:www-data /var/www/kaolack
   sudo chmod -R 755 /var/www/kaolack
   sudo find /var/www/kaolack -type d -exec chmod 755 {} \;
   sudo find /var/www/kaolack -type f -exec chmod 644 {} \;
   ```

4. **Nettoyez et recréez le répertoire dist** :
   ```bash
   sudo rm -rf /var/www/kaolack/dist
   sudo mkdir -p /var/www/kaolack/dist
   sudo chown www-data:www-data /var/www/kaolack/dist
   sudo chmod 755 /var/www/kaolack/dist
   ```

5. **Relancez le build avec le bon utilisateur** :
   ```bash
   cd /var/www/kaolack
   sudo -u www-data npm run build
   ```

6. **Redémarrez les services** :
   ```bash
   cd /var/www/kaolack/backend
   pm2 start kaolack-backend
   ```

### Option 3: Solution alternative (si www-data ne fonctionne pas)

1. **Utilisez l'utilisateur ubuntu** :
   ```bash
   ssh ubuntu@51.68.70.83
   cd /var/www/kaolack
   
   # Changer le propriétaire
   sudo chown -R ubuntu:ubuntu /var/www/kaolack
   
   # Nettoyer et rebuild
   rm -rf dist
   npm run build
   
   # Remettre les permissions pour nginx
   sudo chown -R www-data:www-data /var/www/kaolack/dist
   sudo chmod -R 755 /var/www/kaolack/dist
   ```

## 🔍 Vérification

Après correction, vérifiez que :
```bash
# Vérifier les permissions
ls -la /var/www/kaolack/dist/

# Vérifier que le site fonctionne
curl -I https://portail.kaolackcommune.sn

# Vérifier PM2
pm2 status
```

## ⚠️ Prévention

Pour éviter ce problème à l'avenir :
- Toujours exécuter le build avec l'utilisateur approprié (`www-data` ou `ubuntu`)
- Utiliser le script `vps-update-quick.sh` qui gère les permissions automatiquement
- Éviter d'exécuter `npm run build` en tant que `root`

## 🚀 Commande finale pour vérifier que tout fonctionne

```bash
curl https://portail.kaolackcommune.sn/api/health
```
