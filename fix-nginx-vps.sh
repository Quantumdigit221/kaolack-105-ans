#!/bin/bash

# Script pour corriger la configuration Nginx sur le VPS
# Usage: sudo bash fix-nginx-vps.sh

set -e

echo "🔧 Correction de la configuration Nginx..."

# Vérifier si le fichier de configuration existe dans sites-available
if [ -f "/etc/nginx/sites-available/kaolack" ]; then
    echo "✅ Fichier /etc/nginx/sites-available/kaolack trouvé"
    CONFIG_FILE="/etc/nginx/sites-available/kaolack"
elif [ -f "/etc/nginx/sites-available/default" ]; then
    echo "✅ Utilisation du fichier default"
    CONFIG_FILE="/etc/nginx/sites-available/default"
else
    echo "📝 Création d'un nouveau fichier de configuration..."
    CONFIG_FILE="/etc/nginx/sites-available/kaolack"
fi

# Créer une sauvegarde
sudo cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Créer la configuration correcte
sudo tee "$CONFIG_FILE" > /dev/null << 'EOF'
server {
    listen 80;
    server_name portail.kaolackcommune.sn www.portail.kaolackcommune.sn;
    
    # Redirection vers HTTPS
    return 301 https://portail.kaolackcommune.sn$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portail.kaolackcommune.sn www.portail.kaolackcommune.sn;
    
    # Chemins vers les certificats SSL
    ssl_certificate /etc/letsencrypt/live/portail.kaolackcommune.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portail.kaolackcommune.sn/privkey.pem;
    
    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Répertoire racine pour les fichiers statiques (frontend)
    root /var/www/kaolack/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/kaolack_access.log;
    error_log /var/log/nginx/kaolack_error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # API Backend proxy - CORRIGÉ pour pointer vers localhost:3001
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://127.0.0.1:3001/api/health;
        access_log off;
    }
    
    # Upload files
    location /uploads/ {
        alias /var/www/kaolack/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Static files with long expiry
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Activer le site si ce n'est pas déjà fait
if [ ! -L "/etc/nginx/sites-enabled/kaolack" ] && [ "$CONFIG_FILE" = "/etc/nginx/sites-available/kaolack" ]; then
    sudo ln -sf /etc/nginx/sites-available/kaolack /etc/nginx/sites-enabled/
fi

# Désactiver le site default si kaolack est activé
if [ -L "/etc/nginx/sites-enabled/default" ] && [ -L "/etc/nginx/sites-enabled/kaolack" ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Tester la configuration
echo "🧪 Test de la configuration Nginx..."
if sudo nginx -t; then
    echo "✅ Configuration valide"
    echo "🔄 Rechargement de Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx rechargé avec succès"
    echo ""
    echo "🧪 Test de l'endpoint API..."
    curl -I https://portail.kaolackcommune.sn/api/health || echo "⚠️  Vérifiez que le backend tourne sur le port 3001"
else
    echo "❌ Erreur dans la configuration Nginx"
    echo "📋 Restauration de la sauvegarde..."
    sudo cp "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)" "$CONFIG_FILE"
    exit 1
fi

echo ""
echo "✅ Configuration Nginx corrigée !"
echo "📝 Fichier de configuration: $CONFIG_FILE"
echo "💾 Sauvegarde créée: ${CONFIG_FILE}.backup.*"
