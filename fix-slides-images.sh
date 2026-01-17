#!/bin/bash

# =========================================
# SCRIPT DE GESTION DES IMAGES SLIDES
# =========================================

set -e

echo "🖼️ GESTION DES IMAGES SLIDES - KAOLACK 105 ANS"
echo "==============================================="

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"
UPLOAD_DIR="$DEPLOY_DIR/uploads"

echo "🔍 ÉTAPE 1: Vérification des images slides..."
echo "=============================================="

# Vérifier les images dans les slides
echo "Images actuelles dans les slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image FROM slides WHERE image IS NOT NULL AND image != '' ORDER BY id;
" 2>/dev/null || echo "Erreur lors de la lecture des slides"

echo ""
echo "📁 ÉTAPE 2: Vérification des fichiers physiques..."
echo "================================================="

# Vérifier si le répertoire uploads existe
if [ ! -d "$UPLOAD_DIR" ]; then
    echo "📁 Création du répertoire uploads..."
    mkdir -p $UPLOAD_DIR
    chown www-data:www-data $UPLOAD_DIR
    chmod 755 $UPLOAD_DIR
fi

echo "Contenu du répertoire uploads :"
ls -la $UPLOAD_DIR

echo ""
echo "🔧 ÉTAPE 3: Correction des URLs slides..."
echo "=========================================="

# Mettre à jour les URLs des slides pour utiliser le bon format
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories << 'EOF'
-- Corriger les URLs des slides pour qu'elles pointent vers /uploads/
UPDATE slides SET 
    image = REPLACE(image, 'http://127.0.0.1:3001/uploads/', '/uploads/'),
    image = REPLACE(image, 'http://localhost:3001/uploads/', '/uploads/'),
    image = REPLACE(image, 'https://portail.kaolackcommune.sn/uploads/', '/uploads/');

-- Pour les slides qui n'ont que le nom de fichier, ajouter le chemin complet
UPDATE slides SET 
    image = CONCAT('/uploads/', image)
WHERE image IS NOT NULL 
  AND image NOT LIKE 'http://%'
  AND image NOT LIKE '/uploads/%'
  AND image != '';
EOF

echo "✅ URLs slides corrigées"

echo ""
echo "🔍 ÉTAPE 4: Vérification après correction..."
echo "============================================="

echo "Images des slides après correction :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, image FROM slides WHERE image IS NOT NULL AND image != '' ORDER BY id;
" 2>/dev/null || echo "Erreur lors de la lecture des slides"

echo ""
echo "🔧 ÉTAPE 5: Configuration Nginx pour les uploads..."
echo "=================================================="

# Vérifier la configuration Nginx pour les uploads
cat > /etc/nginx/sites-available/kaolack-uploads << 'EOF'
# Configuration pour servir les fichiers uploads
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Servir les fichiers uploads statiquement
    location /uploads/ {
        alias $UPLOAD_DIR/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Sécurité
        location ~* \.(php|jsp|asp|sh|py)$ {
            deny all;
        }
    }
    
    # Rediriger vers HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Configuration SSL (à compléter avec certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Servir les fichiers uploads
    location /uploads/ {
        alias $UPLOAD_DIR/;
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
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
    
    # React Router - SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Activer la configuration
ln -sf /etc/nginx/sites-available/kaolack-uploads /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t && systemctl reload nginx

echo "✅ Configuration Nginx mise à jour"

echo ""
echo "🔄 ÉTAPE 6: Redémarrage des services..."
echo "========================================"

cd $DEPLOY_DIR/backend
pm2 restart kaolack-backend

echo "✅ Services redémarrés"

echo ""
echo "🔍 ÉTAPE 7: Test final..."
echo "============================="

sleep 3

echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Test des endpoints :"
echo "• Slides API : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides)"
echo "• News API : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news)"
echo "• Posts API : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/posts)"

echo ""
echo "🖼️ Test des images slides :"
echo "Images dans les slides :"
mysql -u kaolack_user -pKaolack2024Secure! kaolack_stories -e "
SELECT id, title, 
       CASE 
           WHEN image LIKE '/uploads/%' THEN CONCAT('https://$DOMAIN', image)
           WHEN image LIKE 'http://%' THEN image
           ELSE CONCAT('https://$DOMAIN/uploads/', image)
       END as full_url
FROM slides 
WHERE image IS NOT NULL AND image != '' 
ORDER BY id 
LIMIT 5;
" 2>/dev/null || echo "Erreur lors de la lecture"

echo ""
echo "🎉 GESTION DES IMAGES SLIDES TERMINÉE"
echo "======================================"
echo "🌐 Site : https://$DOMAIN"
echo "📁 Uploads : $UPLOAD_DIR"
echo ""
echo "✅ Actions effectuées :"
echo "• Vérification des images slides"
echo "• Correction des URLs pour /uploads/"
echo "• Configuration Nginx pour /uploads/"
echo "• Redémarrage des services"
echo ""
echo "🔄 Vérification manuelle :"
echo "1. Visiter https://$DOMAIN"
echo "2. Vérifier que les images des slides s'affichent"
echo "3. Vérifier la console navigateur"
