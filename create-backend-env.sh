#!/bin/bash

# Script pour créer le fichier .env du backend sur le VPS
# Usage: bash create-backend-env.sh

echo "📝 Création du fichier .env pour le backend..."

cd ~/kaolack-105-ans/backend || exit 1

# Demander les informations nécessaires
echo ""
echo "Veuillez entrer les informations suivantes (appuyez sur Entrée pour utiliser les valeurs par défaut) :"
echo ""

read -p "DB_HOST [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "DB_USER [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "DB_PASSWORD: " DB_PASSWORD
echo ""

read -p "DB_NAME [kaolack_stories_connect]: " DB_NAME
DB_NAME=${DB_NAME:-kaolack_stories_connect}

read -p "DB_PORT [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "PORT [3001]: " PORT
PORT=${PORT:-3001}

read -p "NODE_ENV [production]: " NODE_ENV
NODE_ENV=${NODE_ENV:-production}

read -p "FRONTEND_URL [https://portail.kaolackcommune.sn]: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://portail.kaolackcommune.sn}

# Générer un JWT_SECRET aléatoire si non fourni
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi

# Créer le fichier .env
cat > .env << EOF
# Configuration de la base de données MySQL
DB_HOST=${DB_HOST}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=${DB_PORT}

# Configuration du serveur
PORT=${PORT}
NODE_ENV=${NODE_ENV}

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Configuration des fichiers uploadés
UPLOAD_DIR=/var/www/kaolack/uploads
MAX_FILE_SIZE=52428800

# Configuration CORS
FRONTEND_URL=${FRONTEND_URL}
CORS_ORIGIN=${FRONTEND_URL}

# Configuration de sécurité
BCRYPT_ROUNDS=12
SESSION_EXPIRY=86400
JWT_EXPIRY=7d
EOF

echo ""
echo "✅ Fichier .env créé avec succès !"
echo ""
echo "📋 Contenu du fichier .env :"
echo "----------------------------------------"
cat .env | grep -v "PASSWORD" | grep -v "SECRET"
echo "----------------------------------------"
echo ""
echo "⚠️  IMPORTANT: Vérifiez que les informations de base de données sont correctes !"
echo ""
