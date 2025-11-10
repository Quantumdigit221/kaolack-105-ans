#!/bin/bash

# Script de déploiement automatique
echo "🚀 Déploiement en cours..."

# 1. Construction du frontend
echo "📦 Construction du frontend..."
npm run build

# 2. Création du dossier de déploiement
mkdir -p deploy/frontend
mkdir -p deploy/backend

# 3. Copie des fichiers frontend (dist)
echo "📂 Copie des fichiers frontend..."
cp -r dist/* deploy/frontend/
cp .htaccess deploy/frontend/

# 4. Copie des fichiers backend
echo "📂 Copie des fichiers backend..."
cp -r backend/* deploy/backend/
cp backend/.env.production deploy/backend/.env

# 5. Nettoyage des fichiers de développement
echo "🧹 Nettoyage..."
rm -f deploy/backend/.env.local
rm -rf deploy/backend/node_modules

echo "✅ Déploiement préparé dans le dossier 'deploy/'"
echo "📝 Instructions:"
echo "1. Uploadez 'deploy/frontend/' vers public_html/"
echo "2. Uploadez 'deploy/backend/' vers un dossier backend/"
echo "3. Configurez les variables d'environnement"
echo "4. Installez les dépendances: npm install --production"
echo "5. Exécutez les migrations: npx sequelize-cli db:migrate"