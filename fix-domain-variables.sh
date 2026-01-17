#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION DES VARIABLES $DOMAIN
# =========================================

set -e

echo "🔧 CORRECTION DES VARIABLES $DOMAIN - KAOLACK 105 ANS"
echo "===================================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DOMAIN="portail.kaolackcommune.sn"
DEPLOY_DIR="/var/www/kaolack"

echo "🔍 ÉTAPE 1: Diagnostic des URLs avec $DOMAIN..."
echo "=============================================="

echo "URLs actuelles dans les slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image FROM slides WHERE image LIKE '%\$DOMAIN%' OR image LIKE '%\$domain%';
" 2>/dev/null || echo "Erreur lecture slides"

echo ""
echo "URLs actuelles dans les posts :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image_url FROM posts WHERE image_url LIKE '%\$DOMAIN%' OR image_url LIKE '%\$domain%';
" 2>/dev/null || echo "Erreur lecture posts"

echo ""
echo "🔧 ÉTAPE 2: Correction des variables $DOMAIN..."
echo "=============================================="

# Correction des variables $DOMAIN dans toutes les tables
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << EOF
-- Slides : remplacer $DOMAIN par le vrai domaine
UPDATE slides SET 
    image = REPLACE(image, 'https://\$DOMAIN/uploads/', 'https://$DOMAIN/uploads/'),
    image = REPLACE(image, 'http://\$DOMAIN/uploads/', 'https://$DOMAIN/uploads/'),
    image = REPLACE(image, 'https://\$domain/uploads/', 'https://$DOMAIN/uploads/'),
    image = REPLACE(image, 'http://\$domain/uploads/', 'https://$DOMAIN/uploads/');

-- Posts : remplacer $DOMAIN par le vrai domaine
UPDATE posts SET 
    image_url = REPLACE(image_url, 'https://\$DOMAIN/uploads/', 'https://$DOMAIN/uploads/'),
    image_url = REPLACE(image_url, 'http://\$DOMAIN/uploads/', 'https://$DOMAIN/uploads/'),
    image_url = REPLACE(image_url, 'https://\$domain/uploads/', 'https://$DOMAIN/uploads/'),
    image_url = REPLACE(image_url, 'http://\$domain/uploads/', 'https://$DOMAIN/uploads/');

-- News : remplacer $DOMAIN par le vrai domaine
UPDATE news SET 
    image_url = REPLACE(image_url, 'https://\$DOMAIN/uploads/', 'https://$DOMAIN/uploads/'),
    image_url = REPLACE(image_url, 'http://\$DOMAIN/uploads/', 'https://$DOMAIN/uploads/'),
    image_url = REPLACE(image_url, 'https://\$domain/uploads/', 'https://$DOMAIN/uploads/'),
    image_url = REPLACE(image_url, 'http://\$domain/uploads/', 'https://$DOMAIN/uploads/');
EOF

echo "✅ Variables $DOMAIN corrigées"

echo ""
echo "🔍 ÉTAPE 3: Vérification après correction..."
echo "=========================================="

echo "URLs des slides après correction :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image FROM slides WHERE image IS NOT NULL AND image != '' ORDER BY id;
" 2>/dev/null || echo "Erreur lecture slides"

echo ""
echo "URLs des posts après correction :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image_url FROM posts WHERE image_url IS NOT NULL AND image_url != '' ORDER BY id LIMIT 3;
" 2>/dev/null || echo "Erreur lecture posts"

echo ""
echo "🔄 ÉTAPE 4: Redémarrage des services..."
echo "======================================"

cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend

systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 5: Test final..."
echo "========================"

sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Posts : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/posts)"

echo ""
echo "🖼️ Test d'accès aux images :"
echo "Images des slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT image FROM slides WHERE image IS NOT NULL AND image != '' ORDER BY id LIMIT 2;
" 2>/dev/null | grep -v "image" | while read image_url; do
    if [ -n "$image_url" ]; then
        echo "URL: $image_url"
        curl -s -o /dev/null -w "Status: %{http_code}" "$image_url"
        echo ""
    fi
done

echo ""
echo "🎯 Vérification qu'il n'y a plus de $DOMAIN :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT 
    (SELECT COUNT(*) FROM slides WHERE image LIKE '%\$DOMAIN%' OR image LIKE '%\$domain%') as slides_with_domain,
    (SELECT COUNT(*) FROM posts WHERE image_url LIKE '%\$DOMAIN%' OR image_url LIKE '%\$domain%') as posts_with_domain,
    (SELECT COUNT(*) FROM news WHERE image_url LIKE '%\$DOMAIN%' OR image_url LIKE '%\$domain%') as news_with_domain;
" 2>/dev/null || echo "0 0 0"

echo ""
echo "🎉 CORRECTION $DOMAIN TERMINÉE"
echo "=============================="
echo "🌐 Site : https://$DOMAIN"
echo "🔧 API : https://$DOMAIN/api"
echo "📁 Uploads : https://$DOMAIN/uploads"
echo ""
echo "✅ Actions effectuées :"
echo "• Remplacement des variables \$DOMAIN par le vrai domaine"
echo "• Correction de toutes les URLs dans la base de données"
echo "• Redémarrage des services"
echo ""
echo "🔄 Actions utilisateur :"
echo "1. Vider cache navigateur (Ctrl+Shift+Delete)"
echo "2. Recharger page (Ctrl+F5)"
echo "3. Vérifier que les images s'affichent"
