#!/bin/bash

# =========================================
# SCRIPT DE CORRECTION RAPIDE NGINX
# =========================================

set -e

echo "🌐 CORRECTION RAPIDE NGINX - KAOLACK 105 ANS"
echo "=========================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DOMAIN="portail.kaolackcommune.sn"
DEPLOY_DIR="/var/www/kaolack"

echo "🔧 ÉTAPE 1: Configuration Nginx corrigée..."
echo "=========================================="

# Configuration Nginx corrigée avec le domaine en dur
cat > /etc/nginx/sites-available/kaolack << EOF
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
        alias $DEPLOY_DIR/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Sécurité
        location ~* \.(php|jsp|asp|sh|py)$ {
            deny all;
        }
    }
    
    # Frontend
    root $DEPLOY_DIR/dist;
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

# Nettoyer et activer
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/kaolack-uploads
ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/

# Tester et recharger
nginx -t && systemctl reload nginx

echo "✅ Configuration Nginx corrigée"

echo ""
echo "🔧 ÉTAPE 2: Correction URLs dans la base de données..."
echo "=================================================="

# Correction des URLs avec le domaine en dur
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << EOF
-- Slides : URLs complètes HTTPS
UPDATE slides SET 
    image = CASE
        WHEN image LIKE '/uploads/%' THEN CONCAT('https://$DOMAIN', image)
        WHEN image LIKE 'http://%' THEN image
        WHEN image LIKE 'https://%' THEN image
        ELSE CONCAT('https://$DOMAIN/uploads/', image)
    END
WHERE image IS NOT NULL AND image != '';

-- Posts : URLs complètes HTTPS  
UPDATE posts SET 
    image_url = CASE
        WHEN image_url LIKE '/uploads/%' THEN CONCAT('https://$DOMAIN', image_url)
        WHEN image_url LIKE 'http://%' THEN image_url
        WHEN image_url LIKE 'https://%' THEN image_url
        ELSE CONCAT('https://$DOMAIN/uploads/', image_url)
    END
WHERE image_url IS NOT NULL AND image_url != '';

-- News : URLs complètes HTTPS
UPDATE news SET 
    image_url = CASE
        WHEN image_url LIKE '/uploads/%' THEN CONCAT('https://$DOMAIN', image_url)
        WHEN image_url LIKE 'http://%' THEN image_url
        WHEN image_url LIKE 'https://%' THEN image_url
        ELSE CONCAT('https://$DOMAIN/uploads/', image_url)
    END
WHERE image_url IS NOT NULL AND image_url != '';
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
echo "🔍 ÉTAPE 4: Vérification finale..."
echo "================================="

sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Posts : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/posts)"

echo ""
echo "🖼️ Test des images slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image FROM slides WHERE image IS NOT NULL AND image != '' ORDER BY id;
" 2>/dev/null || echo "Erreur lecture slides"

echo ""
echo "🎯 Test d'accès direct aux images :"
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
echo "🎉 CORRECTION NGINX TERMINÉE"
echo "============================"
echo "🌐 Site : https://$DOMAIN"
echo "🔧 API : https://$DOMAIN/api"
echo "📁 Uploads : https://$DOMAIN/uploads"
echo ""
echo "✅ Actions effectuées :"
echo "• Configuration Nginx corrigée"
echo "• URLs dans la base de données corrigées"
echo "• Services redémarrés"
echo ""
echo "🔄 Actions utilisateur :"
echo "1. Vider cache navigateur (Ctrl+Shift+Delete)"
echo "2. Recharger page (Ctrl+F5)"
echo "3. Vérifier console navigateur"
