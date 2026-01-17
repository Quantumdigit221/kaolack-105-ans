#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION DES PROBLÈMES PRODUCTION
# =========================================

set -e

echo "🔧 CORRECTION DES PROBLÈMES PRODUCTION - KAOLACK 105 ANS"
echo "======================================================"

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔍 Diagnostic des problèmes..."

# 1. Vérifier les logs du backend
echo "📋 Vérification des logs backend..."
pm2 logs kaolack-backend --lines 20

# 2. Vérifier la configuration de l'environnement
echo "⚙️ Vérification de la configuration..."
cd $DEPLOY_DIR

if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant"
    exit 1
fi

# 3. Corriger les URLs dans la base de données
echo "🗄️ Correction des URLs dans la base de données..."
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
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

EOF

echo "✅ URLs corrigées dans la base de données"

# 4. Mettre à jour le fichier .env pour la production
echo "📝 Mise à jour du fichier .env..."
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

# Frontend
VITE_API_URL=https://$DOMAIN/api

# URLs de production
BASE_URL=https://$DOMAIN
UPLOAD_URL=https://$DOMAIN/uploads

# Google Gemini (optionnel)
GOOGLE_GEMINI_API_KEY=
EOF

# Copier pour le backend
cp $DEPLOY_DIR/.env $DEPLOY_DIR/backend/.env

echo "✅ Fichier .env mis à jour"

# 5. Vérifier la route /api/news
echo "🔍 Test de la route /api/news..."
sleep 2
curl -s -o /tmp/news_test.json -w "%{http_code}" https://$DOMAIN/api/news

if [ "$(cat /tmp/news_test.json)" = "500" ]; then
    echo "❌ La route /api/news retourne encore une erreur 500"
    echo "📋 Logs détaillés du backend :"
    pm2 logs kaolack-backend --lines 50
else
    echo "✅ Route /api/news fonctionne"
fi

# 6. Redémarrer les services
echo "🔄 Redémarrage des services..."
cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend

# Recharger Nginx
systemctl reload nginx

echo "✅ Services redémarrés"

# 7. Vérification finale
echo "🔍 Vérification finale..."
sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Auth/me : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/auth/me)"

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo "========================="
echo "🌐 Vérifiez le site : https://$DOMAIN"
echo "🔧 Console développeur pour vérifier les erreurs"
echo ""
echo "📝 Actions manuelles si nécessaire :"
echo "1. Vider le cache du navigateur"
echo "2. Recharger la page (Ctrl+F5)"
echo "3. Vérifier la console pour d'autres erreurs"
