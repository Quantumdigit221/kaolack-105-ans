# Corrections Manuelles - Production Kaolack 105 ANS

## 🚨 Problèmes identifiés dans les logs navigateur :

### 1. Erreur 500 sur `/api/news`
```
GET https://portail.kaolackcommune.sn/api/news 500 (Internal Server Error)
```

### 2. Mixed Content (HTTPS/HTTP)
```
Mixed Content: The page at 'https://portail.kaolackcommune.sn/' was loaded over HTTPS, but requested an insecure element 'http://127.0.0.1:3001/uploads/...'
```

### 3. Images avec URLs incorrectes
```
GET http://127.0.0.1:3001/uploads/post-1768584230347-700221822.jpg net::ERR_CONNECTION_REFUSED
```

## 🔧 Solutions

### Option 1: Script de correction automatique

```bash
ssh ubuntu@51.68.70.83
cd /tmp
wget https://raw.githubusercontent.com/Quantumdigit221/kaolack-105-ans/main/fix-production-issues.sh
chmod +x fix-production-issues.sh
sudo ./fix-production-issues.sh
```

### Option 2: Corrections manuelles étape par étape

#### A. Corriger les URLs dans la base de données

```bash
ssh ubuntu@51.68.70.83
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories
```

```sql
-- Corriger les URLs des images dans les posts
UPDATE posts SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://portail.kaolackcommune.sn')
WHERE image_url IS NOT NULL;

-- Corriger les URLs des images dans les slides
UPDATE slides SET 
    image = REPLACE(image, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn'),
    image = REPLACE(image, 'http://localhost:3001', 'https://portail.kaolackcommune.sn')
WHERE image IS NOT NULL;

-- Corriger les URLs des actualités
UPDATE news SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://portail.kaolackcommune.sn')
WHERE image_url IS NOT NULL;
```

#### B. Mettre à jour le fichier .env

```bash
sudo nano /var/www/kaolack/.env
```

Ajouter/modifier ces lignes :
```env
NODE_ENV=production
PORT=3003
BASE_URL=https://portail.kaolackcommune.sn
UPLOAD_URL=https://portail.kaolackcommune.sn/uploads
CORS_ORIGIN=https://portail.kaolackcommune.sn
```

#### C. Vérifier la route /api/news

```bash
# Tester l'endpoint
curl -v https://portail.kaolackcommune.sn/api/news

# Vérifier les logs du backend
pm2 logs kaolack-backend --lines 50
```

#### D. Redémarrer les services

```bash
cd /var/www/kaolack/backend
pm2 restart kaolack-backend
sudo systemctl reload nginx
```

### Option 3: Correction rapide des images

Si seules les images posent problème :

```bash
ssh ubuntu@51.68.70.83

# Mettre à jour les URLs dans la base de données
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
UPDATE posts SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn') WHERE image_url IS NOT NULL;
UPDATE slides SET image = REPLACE(image, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn') WHERE image IS NOT NULL;
UPDATE news SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn') WHERE image_url IS NOT NULL;
"

# Redémarrer le backend
pm2 restart kaolack-backend
```

## 🔍 Vérification après corrections

1. **Vider le cache du navigateur** (Ctrl+Shift+Delete)
2. **Recharger la page** (Ctrl+F5)
3. **Vérifier la console** pour d'autres erreurs
4. **Tester les endpoints** :

```bash
curl https://portail.kaolackcommune.sn/api/slides
curl https://portail.kaolackcommune.sn/api/news
curl https://portail.kaolackcommune.sn/api/auth/me
```

## 🚨 Si l'erreur 500 persiste sur /api/news

Vérifier les logs détaillés :

```bash
pm2 logs kaolack-backend --lines 100

# Ou vérifier les logs nginx
sudo tail -f /var/log/nginx/kaolack_error.log
```

Causes possibles :
- Problème de connexion à la base de données
- Erreur dans le code du routeur news
- Permissions sur les fichiers
- Variable d'environnement manquante

## 📋 Checklist finale

- [ ] URLs des images corrigées dans la BDD
- [ ] Fichier .env mis à jour pour la production
- [ ] Backend redémarré
- [ ] Nginx rechargé
- [ ] Cache navigateur vidé
- [ ] Console sans erreurs
- [ ] Images qui s'affichent correctement
- [ ] API /news qui fonctionne
