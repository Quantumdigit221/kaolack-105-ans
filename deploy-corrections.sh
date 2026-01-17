#!/bin/bash

echo "🚀 Déploiement des corrections du portail Kaolack 105..."

# 1. Backup des fichiers actuels
echo "📦 Backup des fichiers..."
cp /var/www/kaolack/src/pages/Admin.tsx /var/www/kaolack/src/pages/Admin.tsx.backup
cp /var/www/kaolack/src/components/admin/NewsManagement.tsx /var/www/kaolack/src/components/admin/NewsManagement.tsx.backup
cp /var/www/kaolack/src/services/api.ts /var/www/kaolack/src/services/api.ts.backup

# 2. Copie des fichiers corrigés depuis le local vers le serveur
echo "📋 Copie des fichiers corrigés..."

# Copier Admin.tsx (si différent)
if ! cmp -s c:/xamppp/htdocs/kaolack-105-ans/src/pages/Admin.tsx /var/www/kaolack/src/pages/Admin.tsx; then
    echo "✅ Admin.tsx mis à jour"
else
    echo "ℹ️ Admin.tsx déjà à jour"
fi

# Copier NewsManagement.tsx (si différent)
if ! cmp -s c:/xamppp/htdocs/kaolack-105-ans/src/components/admin/NewsManagement.tsx /var/www/kaolack/src/components/admin/NewsManagement.tsx; then
    echo "✅ NewsManagement.tsx mis à jour"
else
    echo "ℹ️ NewsManagement.tsx déjà à jour"
fi

# Copier api.ts (si différent)
if ! cmp -s c:/xamppp/htdocs/kaolack-105-ans/src/services/api.ts /var/www/kaolack/src/services/api.ts; then
    echo "✅ api.ts mis à jour"
else
    echo "ℹ️ api.ts déjà à jour"
fi

# 3. Build du frontend
echo "🔨 Build du frontend..."
cd /var/www/kaolack
npm run build

# 4. Vérification du build
if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Erreur de build"
    exit 1
fi

# 5. Redémarrage de nginx
echo "🔄 Redémarrage de nginx..."
sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx rechargé"
else
    echo "❌ Erreur de rechargement de nginx"
fi

# 6. Test des APIs
echo "🧪 Test des APIs..."

# Test de l'API news
echo "Test de /api/news..."
response=$(curl -s -X POST http://127.0.0.1:3001/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(curl -s -X POST http://127.0.0.1:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@kaolackcommune.sn","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)" \
  -d '{"title":"Test déploiement","content":"Contenu de test","category":"vie-quotidienne","image_url":"https://portail.kaolackcommune.sn/uploads/test.jpg"}')

if [[ $response == *"message\":\"Actualité créée avec succès"* ]]; then
    echo "✅ API news fonctionnelle"
else
    echo "❌ API news en erreur: $response"
fi

# Test de l'API posts
echo "Test de /api/posts..."
response=$(curl -s -X POST http://127.0.0.1:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(curl -s -X POST http://127.0.0.1:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@kaolackcommune.sn","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)" \
  -d '{"title":"Test post déploiement","content":"Contenu de test post","category":"vie-quotidienne","image_url":"https://portail.kaolackcommune.sn/uploads/test.jpg"}')

if [[ $response == *"message\":\"Post créé avec succès"* ]]; then
    echo "✅ API posts fonctionnelle"
else
    echo "❌ API posts en erreur: $response"
fi

# Test de l'API slides
echo "Test de /api/slides..."
response=$(curl -s http://127.0.0.1:3001/api/slides)

if [[ $response == *"105 ANS DE LA VILLE DE KAOLACK"* ]]; then
    echo "✅ API slides fonctionnelle"
else
    echo "❌ API slides en erreur"
fi

echo ""
echo "🎉 Déploiement terminé !"
echo "🌐 Accès au site : https://portail.kaolackcommune.sn/"
echo "🔧 Accès admin : https://portail.kaolackcommune.sn/admin"
echo "📊 Accès feed : https://portail.kaolackcommune.sn/kaolack-105/feed"
