#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION RAPIDE FINALE
# =========================================

set -e

echo "🚀 CORRECTION RAPIDE FINALE - KAOLACK 105 ANS"
echo "=============================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔧 ÉTAPE 1: Correction des dates problématiques..."
echo "==============================================="

# Correction simple des dates
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
-- Posts avec dates NULL
UPDATE posts SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL OR updated_at IS NULL;

-- Posts avec dates invalides (utiliser LIKE pour éviter l'erreur)
UPDATE posts SET created_at = NOW(), updated_at = NOW() WHERE created_at LIKE '0000%';

-- News avec dates NULL
UPDATE news SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL OR updated_at IS NULL;

-- News avec dates invalides
UPDATE news SET created_at = NOW(), updated_at = NOW() WHERE created_at LIKE '0000%';
EOF

echo "✅ Dates corrigées"

echo ""
echo "🔧 ÉTAPE 2: Correction URLs finale..."
echo "=================================="

# Correction URLs
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
UPDATE posts SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN');
UPDATE posts SET image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN');
UPDATE slides SET image = REPLACE(image, 'http://127.0.0.1:3001', 'https://$DOMAIN');
UPDATE slides SET image = REPLACE(image, 'http://localhost:3001', 'https://$DOMAIN');
UPDATE news SET image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN');
UPDATE news SET image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN');
EOF

echo "✅ URLs corrigées"

echo ""
echo "🔄 ÉTAPE 3: Redémarrage services..."
echo "================================="

cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend
systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 4: Vérification..."
echo "============================="

sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Posts : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/posts)"

echo ""
echo "🎯 Vérification URLs restantes :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT 'Posts' as table, COUNT(*) as count FROM posts WHERE image_url LIKE 'http://127.0.0.1:3001%'
UNION ALL
SELECT 'Slides', COUNT(*) FROM slides WHERE image LIKE 'http://127.0.0.1:3001%'
UNION ALL  
SELECT 'News', COUNT(*) FROM news WHERE image_url LIKE 'http://127.0.0.1:3001%';
" 2>/dev/null

echo ""
echo "🎉 CORRECTION TERMINÉE"
echo "======================"
echo "🌐 Site : https://$DOMAIN"
echo ""
echo "✅ Problèmes corrigés :"
echo "• Dates invalides dans posts/news"
echo "• URLs avec 127.0.0.1:3001"
echo "• Services redémarrés"
echo ""
echo "🔄 Actions utilisateur :"
echo "1. Vider cache navigateur (Ctrl+Shift+Delete)"
echo "2. Recharger page (Ctrl+F5)"
echo "3. Vérifier console navigateur"
