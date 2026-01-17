# Correction Rapide Base de Données - Images

## 🚨 Problème principal
Les images dans la base de données utilisent encore des URLs `http://127.0.0.1:3001` au lieu de `https://portail.kaolackcommune.sn`

## 🔧 Solution immédiate

### Option 1: Script de diagnostic complet
```bash
ssh ubuntu@51.68.70.83
cd /tmp
wget https://raw.githubusercontent.com/Quantumdigit221/kaolack-105-ans/main/diagnose-and-fix.sh
chmod +x diagnose-and-fix.sh
sudo ./diagnose-and-fix.sh
```

### Option 2: Correction manuelle rapide des URLs
```bash
ssh ubuntu@51.68.70.83

# Correction des URLs dans toutes les tables
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
UPDATE posts SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn') WHERE image_url LIKE 'http://127.0.0.1:3001%';
UPDATE slides SET image = REPLACE(image, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn') WHERE image LIKE 'http://127.0.0.1:3001%';
UPDATE news SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn') WHERE image_url LIKE 'http://127.0.0.1:3001%';
"

# Redémarrer le backend
pm2 restart kaolack-backend
```

### Option 3: Vérification et correction manuelle
```bash
ssh ubuntu@51.68.70.83

# Voir les URLs problématiques
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT 'posts' as table_name, id, image_url FROM posts WHERE image_url LIKE 'http://127.0.0.1:3001%' 
UNION ALL
SELECT 'slides' as table_name, id, image as image_url FROM slides WHERE image LIKE 'http://127.0.0.1:3001%'
UNION ALL  
SELECT 'news' as table_name, id, image_url FROM news WHERE image_url LIKE 'http://127.0.0.1:3001%';
"
```

## 🔍 Diagnostic de l'erreur 500 sur /api/news

### Vérifier la table news
```bash
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SHOW TABLES LIKE 'news';
DESCRIBE news;
SELECT COUNT(*) FROM news;
"
```

### Vérifier les logs du backend
```bash
pm2 logs kaolack-backend --lines 50
```

### Test direct de l'API
```bash
curl -v https://portail.kaolackcommune.sn/api/news
```

## 🎯 Actions recommandées

1. **Exécuter le script de diagnostic** pour identifier la cause exacte
2. **Corriger les URLs** dans la base de données  
3. **Vérifier la table news** (existe-t-elle ?)
4. **Redémarrer les services**
5. **Vider le cache navigateur** et recharger

## 📋 Résultat attendu

Après corrections :
- ✅ Plus d'erreurs Mixed Content
- ✅ Images qui s'affichent correctement  
- ✅ API /news qui retourne 200 au lieu de 500
- ✅ Site entièrement fonctionnel

## 🔧 Si l'erreur 500 persiste

Causes possibles :
- Table `news` manquante ou corrompue
- Modèle `news.js` incorrect  
- Route `news.js` avec erreur
- Problème de connexion BDD

Dans ce cas, le script `diagnose-and-fix.sh` donnera le diagnostic exact.
