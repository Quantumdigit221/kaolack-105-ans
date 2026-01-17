#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION FINALE - URLS ET API NEWS
# =========================================

set -e

echo "🔧 CORRECTION FINALE - URLS ET API NEWS"
echo "======================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔍 ÉTAPE 1: Vérification des URLs problématiques..."
echo "==============================================="

# Voir les URLs avec 127.0.0.1
echo "URLs problématiques dans posts :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, image_url FROM posts WHERE image_url LIKE 'http://127.0.0.1:3001%' LIMIT 5;
" 2>/dev/null || echo "Erreur connexion BDD"

echo ""
echo "URLs problématiques dans slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, image FROM slides WHERE image LIKE 'http://127.0.0.1:3001%' LIMIT 5;
" 2>/dev/null || echo "Erreur connexion BDD"

echo ""
echo "🔧 ÉTAPE 2: Correction forcée des URLs..."
echo "====================================="

# Correction forcée avec REPLACE
echo "Correction posts..."
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
UPDATE posts SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn');
UPDATE posts SET image_url = REPLACE(image_url, 'http://localhost:3001', 'https://portail.kaolackcommune.sn');
EOF

echo "Correction slides..."
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
UPDATE slides SET image = REPLACE(image, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn');
UPDATE slides SET image = REPLACE(image, 'http://localhost:3001', 'https://portail.kaolackcommune.sn');
EOF

echo "Correction news..."
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
UPDATE news SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://portail.kaolackcommune.sn');
UPDATE news SET image_url = REPLACE(image_url, 'http://localhost:3001', 'https://portail.kaolackcommune.sn');
EOF

echo "✅ URLs corrigées"

echo ""
echo "🔍 ÉTAPE 3: Diagnostic de l'erreur /api/news..."
echo "=============================================="

# Test direct pour voir l'erreur exacte
echo "Test de l'API /news avec curl détaillé :"
curl -s https://$DOMAIN/api/news | head -5

echo ""
echo "Vérification des logs backend pour /news :"
pm2 logs kaolack-backend --lines 10 --grep news || echo "Pas de logs récents avec 'news'"

echo ""
echo "🔍 ÉTAPE 4: Vérification de la route /news..."
echo "=============================================="

if [ -f "$DEPLOY_DIR/backend/routes/news.js" ]; then
    echo "✅ Fichier routes/news.js trouvé"
    echo "Recherche d'erreurs dans le fichier :"
    grep -n "error\|catch\|throw" "$DEPLOY_DIR/backend/routes/news.js" | head -5 || echo "Pas d'erreurs évidentes"
else
    echo "❌ Fichier routes/news.js non trouvé"
fi

echo ""
echo "🔍 ÉTAPE 5: Test de la base de données pour news..."
echo "==============================================="

# Test simple de la table news
echo "Test simple de la table news :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT COUNT(*) as total_news FROM news;
SELECT id, title, status FROM news LIMIT 3;
" 2>/dev/null || echo "Erreur lors de l'accès à la table news"

echo ""
echo "🔄 ÉTAPE 6: Redémarrage complet des services..."
echo "=============================================="

# Arrêter et redémarrer complètement
echo "⏸️ Arrêt complet de PM2..."
pm2 delete kaolack-backend || echo "Processus non trouvé"
sleep 2

echo "🚀 Redémarrage du backend..."
cd $DEPLOY_DIR/backend

# Vérifier les dépendances
npm install --production

# Démarrer avec PM2 en mode production
pm2 start server.js --name "kaolack-backend" --env production
pm2 save

# Recharger Nginx
systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 7: Vérification finale..."
echo "================================="

sleep 5

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Auth/me : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/auth/me)"

echo ""
echo "🎯 Vérification des URLs après correction :"
echo "========================================="

echo "URLs restantes avec 127.0.0.1 dans posts :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT COUNT(*) as count FROM posts WHERE image_url LIKE 'http://127.0.0.1:3001%';
" 2>/dev/null || echo "0"

echo "URLs restantes avec 127.0.0.1 dans slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT COUNT(*) as count FROM slides WHERE image LIKE 'http://127.0.0.1:3001%';
" 2>/dev/null || echo "0"

echo ""
echo "🎉 CORRECTION FINALE TERMINÉE"
echo "============================="
echo "🌐 Site : https://$DOMAIN"
echo "🔧 Logs : pm2 logs kaolack-backend"
echo ""
echo "📋 Si /api/news retourne encore 500 :"
echo "1. Vérifiez les logs ci-dessus"
echo "2. La table news est-elle accessible ?"
echo "3. Y a-t-il une erreur dans la route ?"
