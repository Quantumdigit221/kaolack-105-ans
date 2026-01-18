#!/bin/bash

# =========================================
# SCRIPT DE MISE À JOUR FINALE DU VPS
# =========================================

set -e

echo "🚀 MISE À JOUR FINALE DU VPS - KAOLACK 105 ANS"
echo "=============================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔄 ÉTAPE 1: Mise à jour du code..."
echo "================================="

cd $DEPLOY_DIR

echo "📥 Pull des dernières modifications..."
git pull origin main

echo "✅ Code mis à jour"

echo ""
echo "🔧 ÉTAPE 2: Configuration de l'environnement..."
echo "=============================================="

# Configuration .env pour le frontend
cat > $DEPLOY_DIR/.env << EOF
NODE_ENV=production

# URLs pour le frontend
VITE_API_URL=https://$DOMAIN/api
VITE_FRONTEND_URL=https://$DOMAIN
VITE_UPLOAD_URL=https://$DOMAIN/uploads

# Configuration du build
VITE_BASE_URL=/
VITE_MODE=production
EOF

# Configuration .env pour le backend
cat > $DEPLOY_DIR/backend/.env << EOF
# Configuration Backend
NODE_ENV=production
PORT=3003

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=kaolack_user
DB_PASSWORD=Kaolack2024Secure!
DB_NAME=kaolack_stories
DB_CHARSET=utf8mb4

# JWT et Session
JWT_SECRET=kaolack_105_jwt_secret_$(openssl rand -hex 16)
JWT_EXPIRY=7d
SESSION_SECRET=kaolack_105_session_secret_$(openssl rand -hex 16)

# CORS
CORS_ORIGIN=https://$DOMAIN

# Uploads
UPLOAD_DIR=$DEPLOY_DIR/uploads
UPLOAD_URL=https://$DOMAIN/uploads

# URLs de l'application
FRONTEND_URL=https://$DOMAIN
API_URL=https://$DOMAIN/api
BASE_URL=https://$DOMAIN

# Configuration serveur
HOST=0.0.0.0
EOF

echo "✅ Fichiers .env configurés"

echo ""
echo "🏗️ ÉTAPE 3: Rebuild du frontend..."
echo "=================================="

cd $DEPLOY_DIR

echo "📦 Installation des dépendances..."
npm ci

echo "🏗️ Build du frontend..."
npm run build

echo "✅ Frontend rebuildé"

echo ""
echo "🔄 ÉTAPE 4: Vérification finale des URLs..."
echo "=========================================="

# Vérifier qu'il n'y a plus de mauvaises URLs
echo "Vérification des URLs dans la base de données :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT 
    (SELECT COUNT(*) FROM slides WHERE image LIKE 'http://127.0.0.1:%' OR image LIKE 'http://localhost:%') as bad_slides,
    (SELECT COUNT(*) FROM posts WHERE image_url LIKE 'http://127.0.0.1:%' OR image_url LIKE 'http://localhost:%') as bad_posts,
    (SELECT COUNT(*) FROM news WHERE image_url LIKE 'http://127.0.0.1:%' OR image_url LIKE 'http://localhost:%') as bad_news;
" 2>/dev/null || echo "Erreur vérification URLs"

echo ""
echo "🔄 ÉTAPE 5: Redémarrage complet des services..."
echo "============================================"

cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend --update-env

systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 6: Test final complet..."
echo "==============================="

sleep 5

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Posts : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/posts)"
echo "• Auth/me : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/auth/me)"

echo ""
echo "🖼️ Test des images slides :"
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
echo "🎯 Test de l'API /news avec détails :"
echo "Réponse de l'API /news :"
curl -s https://$DOMAIN/api/news | head -3

echo ""
echo "📋 Logs du backend pour /news :"
pm2 logs kaolack-backend --lines 5 | grep -i news || echo "Pas de logs récents avec 'news'"

echo ""
echo "🎉 MISE À JOUR FINALE TERMINÉE"
echo "==============================="
echo "🌐 Site : https://$DOMAIN"
echo "🔧 API : https://$DOMAIN/api"
echo "📁 Uploads : https://$DOMAIN/uploads"
echo ""
echo "✅ Actions effectuées :"
echo "• Mise à jour du code depuis Git"
echo "• Configuration des .env"
echo "• Rebuild complet du frontend"
echo "• Redémarrage des services"
echo "• Test complet des fonctionnalités"
echo ""
echo "🔄 Actions utilisateur :"
echo "1. Vider cache navigateur (Ctrl+Shift+Delete)"
echo "2. Recharger page (Ctrl+F5)"
echo "3. Vérifier toutes les fonctionnalités"
echo ""
echo "📊 État attendu :"
echo "• Slides : Images qui s'affichent correctement"
echo "• News : Plus d'erreur 500"
echo "• Posts : Fonctionnel"
echo "• Authentification : Fonctionnelle"
