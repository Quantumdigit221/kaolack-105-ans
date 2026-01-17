#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION DES URLS FRONTEND
# =========================================

set -e

echo "🌐 CORRECTION DES URLS FRONTEND - KAOLACK 105 ANS"
echo "================================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔍 ÉTAPE 1: Configuration des URLs correctes..."
echo "==============================================="

# Mettre à jour le fichier .env avec les bonnes URLs
cat > $DEPLOY_DIR/.env << EOF
NODE_ENV=production
PORT=3003

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=kaolack_user
DB_PASSWORD=Kaolack2024Secure!
DB_NAME=kaolack_stories
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_change_me_$(openssl rand -hex 32)
JWT_EXPIRY=7d
SESSION_SECRET=your_super_secure_session_secret_change_me_$(openssl rand -hex 32)

# CORS
CORS_ORIGIN=https://$DOMAIN

# Upload
UPLOAD_DIR=$DEPLOY_DIR/uploads

# URLs CORRECTES pour frontend et backend
FRONTEND_URL=https://$DOMAIN
API_URL=http://$DOMAIN/api

# Variables pour le build
VITE_API_URL=https://$DOMAIN/api
VITE_FRONTEND_URL=https://$DOMAIN

# Google Gemini (optionnel)
GOOGLE_GEMINI_API_KEY=
EOF

# Copier pour le backend
cp $DEPLOY_DIR/.env $DEPLOY_DIR/backend/.env

echo "✅ Fichier .env mis à jour"

echo ""
echo "🔧 ÉTAPE 2: Correction des URLs dans la base de données..."
echo "=================================================="

# Correction finale des URLs dans la BDD
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
-- Posts : corriger toutes les URLs incorrectes
UPDATE posts SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://127.0.0.1', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost', 'https://$DOMAIN');

-- Slides : corriger toutes les URLs incorrectes  
UPDATE slides SET 
    image = REPLACE(image, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image = REPLACE(image, 'http://localhost:3001', 'https://$DOMAIN'),
    image = REPLACE(image, 'http://127.0.0.1', 'https://$DOMAIN'),
    image = REPLACE(image, 'http://localhost', 'https://$DOMAIN');

-- News : corriger toutes les URLs incorrectes
UPDATE news SET 
    image_url = REPLACE(image_url, 'http://127.0.0.1:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost:3001', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://127.0.0.1', 'https://$DOMAIN'),
    image_url = REPLACE(image_url, 'http://localhost', 'https://$DOMAIN');
EOF

echo "✅ URLs dans la base de données corrigées"

echo ""
echo "🔍 ÉTAPE 3: Diagnostic de l'API /news..."
echo "============================================"

# Vérifier la table news et sa structure
echo "Structure de la table news :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "DESCRIBE news;" 2>/dev/null || echo "Erreur accès table news"

echo ""
echo "Contenu de la table news (3 premiers) :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "SELECT id, title, status, created_at FROM news LIMIT 3;" 2>/dev/null || echo "Erreur lecture table news"

echo ""
echo "Test direct de la route /news :"
curl -s https://$DOMAIN/api/news | head -3

echo ""
echo "🔄 ÉTAPE 4: Rebuild complet du frontend..."
echo "=========================================="

# Rebuild du frontend avec les nouvelles URLs
cd $DEPLOY_DIR

echo "📦 Installation des dépendances frontend..."
npm ci

echo "🏗️ Build du frontend en production..."
npm run build

if [ -d "$DEPLOY_DIR/dist" ]; then
    echo "✅ Frontend buildé avec succès"
else
    echo "❌ Échec du build frontend"
    exit 1
fi

echo ""
echo "🔄 ÉTAPE 5: Redémarrage complet..."
echo "================================="

# Redémarrer le backend
cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend

# Recharger Nginx
systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 6: Vérification finale..."
echo "================================="

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
echo "🎯 Vérification des URLs après correction :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT 
    (SELECT COUNT(*) FROM posts WHERE image_url LIKE 'http://%') as bad_posts,
    (SELECT COUNT(*) FROM slides WHERE image LIKE 'http://%') as bad_slides,
    (SELECT COUNT(*) FROM news WHERE image_url LIKE 'http://%') as bad_news;
" 2>/dev/null

echo ""
echo "🎉 CORRECTION FRONTEND TERMINÉE"
echo "================================="
echo "🌐 Site : https://$DOMAIN"
echo "🔧 API : https://$DOMAIN/api"
echo ""
echo "✅ Éléments corrigés :"
echo "• Configuration .env avec URLs correctes"
echo "• URLs dans la base de données"
echo "• Rebuild du frontend"
echo "• Redémarrage des services"
echo ""
echo "🔄 Actions utilisateur :"
echo "1. Vider cache navigateur (Ctrl+Shift+Delete)"
echo "2. Recharger page (Ctrl+F5)"
echo "3. Vérifier console navigateur"
