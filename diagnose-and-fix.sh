#!/bin/bash

# =========================================
# SCRIPT DE DIAGNOSTIC ET CORRECTION CIBLÉE
# =========================================

set -e

echo "🔍 DIAGNOSTIC ET CORRECTION CIBLÉE - KAOLACK 105 ANS"
echo "=================================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔍 ÉTAPE 1: Vérification des logs backend détaillés..."
echo "=================================================="

# Afficher les logs récents du backend
echo "📋 Logs PM2 récents :"
pm2 logs kaolack-backend --lines 50 --nostream || echo "Impossible d'obtenir les logs PM2"

echo ""
echo "🔍 ÉTAPE 2: Test direct de l'API /news..."
echo "========================================"

# Test avec curl pour voir l'erreur exacte
echo "Test de /api/news :"
curl -v https://$DOMAIN/api/news 2>&1 | head -20

echo ""
echo "🔍 ÉTAPE 3: Vérification de la base de données..."
echo "=============================================="

# Vérifier si la table news existe
echo "Vérification de la table news :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "SHOW TABLES LIKE 'news';" 2>/dev/null || echo "Erreur connexion BDD"

# Vérifier la structure de la table news
echo "Structure de la table news :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "DESCRIBE news;" 2>/dev/null || echo "Impossible de décrire la table news"

# Vérifier s'il y a des données dans news
echo "Nombre d'entrées dans news :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "SELECT COUNT(*) as count FROM news;" 2>/dev/null || echo "Impossible de compter les entrées"

echo ""
echo "🔍 ÉTAPE 4: Correction des URLs dans la base de données..."
echo "======================================================"

# Correction des URLs avec vérification
echo "Correction des URLs dans posts..."
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
UPDATE posts SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN')
WHERE image_url IS NOT NULL AND (image_url LIKE 'http://127.0.0.1:3001%' OR image_url LIKE 'http://localhost:3001%');
" 2>/dev/null && echo "✅ URLs posts corrigées" || echo "❌ Erreur correction posts"

echo "Correction des URLs dans slides..."
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
UPDATE slides SET 
    image = REPLACE(image, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image = REPLACE(image, 'http://localhost:3001', 'https://$DOMAIN')
WHERE image IS NOT NULL AND (image LIKE 'http://127.0.0.1:3001%' OR image LIKE 'http://localhost:3001%');
" 2>/dev/null && echo "✅ URLs slides corrigées" || echo "❌ Erreur correction slides"

echo "Correction des URLs dans news..."
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
UPDATE news SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN')
WHERE image_url IS NOT NULL AND (image_url LIKE 'http://127.0.0.1:3001%' OR image_url LIKE 'http://localhost:3001%');
" 2>/dev/null && echo "✅ URLs news corrigées" || echo "❌ Erreur correction news"

echo ""
echo "🔍 ÉTAPE 5: Vérification du fichier de route news..."
echo "=================================================="

if [ -f "$DEPLOY_DIR/backend/routes/news.js" ]; then
    echo "✅ Fichier routes/news.js trouvé"
    echo "Premières lignes du fichier :"
    head -20 "$DEPLOY_DIR/backend/routes/news.js"
else
    echo "❌ Fichier routes/news.js non trouvé"
fi

echo ""
echo "🔍 ÉTAPE 6: Vérification du modèle news..."
echo "========================================"

if [ -f "$DEPLOY_DIR/backend/models/news.js" ]; then
    echo "✅ Fichier models/news.js trouvé"
    echo "Premières lignes du fichier :"
    head -20 "$DEPLOY_DIR/backend/models/news.js"
else
    echo "❌ Fichier models/news.js non trouvé"
fi

echo ""
echo "🔍 ÉTAPE 7: Vérification de la configuration..."
echo "=============================================="

if [ -f "$DEPLOY_DIR/backend/.env" ]; then
    echo "✅ Fichier .env trouvé"
    echo "Variables importantes :"
    grep -E "(DB_|NODE_|PORT|CORS)" "$DEPLOY_DIR/backend/.env" | head -10
else
    echo "❌ Fichier .env non trouvé"
fi

echo ""
echo "🔍 ÉTAPE 8: Redémarrage des services..."
echo "===================================="

cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend
systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 9: Test final..."
echo "========================="

sleep 3

echo "Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Auth/me : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/auth/me)"

echo ""
echo "🎯 DIAGNOSTIC TERMINÉ"
echo "===================="
echo "📋 Si l'erreur 500 persiste sur /api/news :"
echo "1. Vérifiez les logs ci-dessus pour l'erreur exacte"
echo "2. La table news existe-t-elle ?"
echo "3. Le modèle news.js est-il correct ?"
echo "4. La route news.js est-elle correcte ?"
echo ""
echo "🌐 Site : https://$DOMAIN"
