#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION DES CONFIGURATIONS .ENV
# =========================================

set -e

echo "⚙️ CORRECTION DES CONFIGURATIONS .ENV - KAOLACK 105 ANS"
echo "===================================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "🔍 ÉTAPE 1: Vérification des fichiers .env actuels..."
echo "=================================================="

echo "Contenu actuel de $DEPLOY_DIR/.env :"
if [ -f "$DEPLOY_DIR/.env" ]; then
    cat $DEPLOY_DIR/.env
else
    echo "❌ Fichier .env principal non trouvé"
fi

echo ""
echo "Contenu actuel de $DEPLOY_DIR/backend/.env :"
if [ -f "$DEPLOY_DIR/backend/.env" ]; then
    cat $DEPLOY_DIR/backend/.env
else
    echo "❌ Fichier .env backend non trouvé"
fi

echo ""
echo "🔧 ÉTAPE 2: Configuration correcte du .env principal..."
echo "======================================================"

# Configuration .env principal pour le frontend
cat > $DEPLOY_DIR/.env << EOF
# Configuration principale
NODE_ENV=production

# URLs pour le frontend
VITE_API_URL=https://$DOMAIN/api
VITE_FRONTEND_URL=https://$DOMAIN
VITE_UPLOAD_URL=https://$DOMAIN/uploads

# Configuration du build
VITE_BASE_URL=/
VITE_MODE=production
EOF

echo "✅ .env principal configuré pour le frontend"

echo ""
echo "🔧 ÉTAPE 3: Configuration correcte du .env backend..."
echo "=================================================="

# Configuration .env backend
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

echo "✅ .env backend configuré"

echo ""
echo "🔧 ÉTAPE 4: Configuration Nginx pour /uploads..."
echo "==============================================="

# Configuration Nginx simplifiée pour /uploads
cat > /etc/nginx/sites-available/kaolack-uploads << 'EOF'
# Configuration pour les uploads
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Servir les uploads statiquement
    location /uploads/ {
        alias /var/www/kaolack/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Sécurité
        location ~* \.(php|jsp|asp|sh|py)$ {
            deny all;
        }
    }
    
    # Frontend
    root /var/www/kaolack/dist;
    index index.html;
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3003/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Activer la configuration
ln -sf /etc/nginx/sites-available/kaolack-uploads /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester et recharger Nginx
nginx -t && systemctl reload nginx

echo "✅ Configuration Nginx mise à jour"

echo ""
echo "🔍 ÉTAPE 5: Vérification des fichiers images..."
echo "=============================================="

# Vérifier que les fichiers images existent
echo "Vérification des fichiers images dans /uploads :"
ls -la $DEPLOY_DIR/uploads/ | grep -E "\.(jpg|jpeg|png|gif)$" | head -5

echo ""
echo "Vérification des images dans les slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image FROM slides WHERE image IS NOT NULL AND image != '';
" 2>/dev/null || echo "Erreur lecture slides"

echo ""
echo "🔧 ÉTAPE 6: Correction des URLs dans la base de données..."
echo "======================================================"

# Correction des URLs pour qu'elles soient complètes
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
-- Slides : s'assurer que les URLs sont complètes
UPDATE slides SET 
    image = CASE
        WHEN image LIKE '/uploads/%' THEN CONCAT('https://$DOMAIN', image)
        WHEN image LIKE 'http://%' THEN image
        WHEN image LIKE 'https://%' THEN image
        ELSE CONCAT('https://$DOMAIN/uploads/', image)
    END
WHERE image IS NOT NULL AND image != '';

-- Posts : correction similaire
UPDATE posts SET 
    image_url = CASE
        WHEN image_url LIKE '/uploads/%' THEN CONCAT('https://$DOMAIN', image_url)
        WHEN image_url LIKE 'http://%' THEN image_url
        WHEN image_url LIKE 'https://%' THEN image_url
        ELSE CONCAT('https://$DOMAIN/uploads/', image_url)
    END
WHERE image_url IS NOT NULL AND image_url != '';

-- News : correction similaire
UPDATE news SET 
    image_url = CASE
        WHEN image_url LIKE '/uploads/%' THEN CONCAT('https://$DOMAIN', image_url)
        WHEN image_url LIKE 'http://%' THEN image_url
        WHEN image_url LIKE 'https://%' THEN image_url
        ELSE CONCAT('https://$DOMAIN/uploads/', image_url)
    END
WHERE image_url IS NOT NULL AND image_url != '';
EOF

echo "✅ URLs dans la base de données corrigées"

echo ""
echo "🔄 ÉTAPE 7: Rebuild complet du frontend..."
echo "=========================================="

cd $DEPLOY_DIR

echo "📦 Réinstallation des dépendances..."
rm -rf node_modules package-lock.json
npm install

echo "🏗️ Build du frontend avec nouvelles variables..."
npm run build

echo "✅ Frontend rebuildé"

echo ""
echo "🔄 ÉTAPE 8: Redémarrage complet..."
echo "================================="

cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend --update-env

systemctl reload nginx

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 9: Vérification finale..."
echo "================================="

sleep 5

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Posts : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/posts)"

echo ""
echo "🖼️ Test des images :"
echo "Test d'accès à une image slide :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT image FROM slides WHERE image IS NOT NULL LIMIT 1;
" 2>/dev/null | tail -1 | while read image_url; do
    if [ -n "$image_url" ]; then
        echo "URL: $image_url"
        curl -s -o /dev/null -w "Status: %{http_code}" "$image_url"
        echo ""
    fi
done

echo ""
echo "🎉 CONFIGURATION .ENV TERMINÉE"
echo "=============================="
echo "🌐 Site : https://$DOMAIN"
echo "🔧 API : https://$DOMAIN/api"
echo "📁 Uploads : https://$DOMAIN/uploads"
echo ""
echo "✅ Configurations corrigées :"
echo "• .env principal (frontend)"
echo "• .env backend"
echo "• Configuration Nginx pour /uploads"
echo "• URLs dans la base de données"
echo "• Rebuild frontend"
echo ""
echo "🔄 Actions utilisateur :"
echo "1. Vider cache navigateur (Ctrl+Shift+Delete)"
echo "2. Recharger page (Ctrl+F5)"
echo "3. Vérifier console navigateur"
