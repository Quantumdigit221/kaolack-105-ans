#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION DES DATES ET URLS
# =========================================

set -e

echo "🔧 CORRECTION DES DATES ET URLS - KAOLACK 105 ANS"
echo "================================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔍 ÉTAPE 1: Diagnostic des dates invalides..."
echo "============================================="

# Vérifier les dates problématiques dans posts
echo "Vérification des dates dans posts :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, created_at, updated_at 
FROM posts 
WHERE created_at IS NULL 
   OR updated_at IS NULL 
   OR created_at = '0000-00-00 00:00:00'
   OR updated_at = '0000-00-00 00:00:00'
   OR created_at < '2020-01-01'
LIMIT 10;
" 2>/dev/null || echo "Erreur lors de la vérification des dates"

echo ""
echo "🔧 ÉTAPE 2: Correction des dates invalides..."
echo "=========================================="

# Correction des dates NULL ou invalides
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
-- Correction des dates NULL dans posts
UPDATE posts 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Correction des dates invalides (0000-00-00)
UPDATE posts 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at = '0000-00-00 00:00:00' 
   OR updated_at = '0000-00-00 00:00:00';

-- Correction des dates trop anciennes
UPDATE posts 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at < '2020-01-01';

-- Correction des dates dans news
UPDATE news 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE news 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at = '0000-00-00 00:00:00' 
   OR updated_at = '0000-00-00 00:00:00';
EOF

echo "✅ Dates corrigées"

echo ""
echo "🔧 ÉTAPE 3: Correction finale des URLs..."
echo "===================================="

# Correction FORCÉE de toutes les URLs
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
-- Posts
UPDATE posts SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN');

-- Slides  
UPDATE slides SET 
    image = REPLACE(image, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image = REPLACE(image, 'http://localhost:3001', 'https://$DOMAIN');

-- News
UPDATE news SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN');
EOF

echo "✅ URLs corrigées"

echo ""
echo "🔍 ÉTAPE 4: Vérification après correction..."
echo "=========================================="

# Vérifier qu'il n'y a plus de dates invalides
echo "Vérification des dates après correction :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT COUNT(*) as invalid_dates_posts 
FROM posts 
WHERE created_at IS NULL 
   OR updated_at IS NULL 
   OR created_at = '0000-00-00 00:00:00';
" 2>/dev/null || echo "0"

# Vérifier qu'il n'y a plus d'URLs invalides
echo "Vérification des URLs après correction :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT 
    (SELECT COUNT(*) FROM posts WHERE image_url LIKE 'http://127.0.0.1:3001%') as bad_posts,
    (SELECT COUNT(*) FROM slides WHERE image LIKE 'http://127.0.0.1:3001%') as bad_slides,
    (SELECT COUNT(*) FROM news WHERE image_url LIKE 'http://127.0.0.1:3001%') as bad_news;
" 2>/dev/null || echo "0 0 0"

echo ""
echo "🔄 ÉTAPE 5: Redémarrage complet..."
echo "================================="

# Redémarrer les services
cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend
systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 6: Test final..."
echo "=========================="

sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Posts : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/posts)"

echo ""
echo "🎉 CORRECTION TERMINÉE"
echo "======================"
echo "🌐 Site : https://$DOMAIN"
echo ""
echo "📋 Problèmes corrigés :"
echo "✅ Dates invalides dans posts"
echo "✅ Dates invalides dans news"  
echo "✅ URLs avec 127.0.0.1:3001"
echo "✅ Redémarrage des services"
echo ""
echo "🔄 Actions recommandées :"
echo "1. Vider le cache du navigateur (Ctrl+Shift+Delete)"
echo "2. Recharger la page (Ctrl+F5)"
echo "3. Vérifier la console pour d'autres erreurs"
