#!/bin/bash

# Script de débogage pour le frontend sur le VPS

echo "🔍 Diagnostic Frontend..."

echo ""
echo "1️⃣ Vérification du répertoire du frontend..."
ls -la /var/www/kaolack/dist/ 2>/dev/null || echo "❌ Le répertoire /var/www/kaolack/dist/ n'existe pas"

echo ""
echo "2️⃣ Vérification de l'index.html..."
ls -lh /var/www/kaolack/dist/index.html 2>/dev/null || echo "❌ index.html n'existe pas"

echo ""
echo "3️⃣ Vérification des permissions..."
ls -ld /var/www/kaolack/ 2>/dev/null || echo "❌ Le répertoire /var/www/kaolack/ n'existe pas"

echo ""
echo "4️⃣ Vérification de la configuration Nginx pour le frontend..."
sudo nginx -T 2>/dev/null | grep -A 10 "root /var/www/kaolack/dist" | head -15

echo ""
echo "5️⃣ Vérification des logs Nginx (dernières erreurs)..."
sudo tail -30 /var/log/nginx/error.log | grep -i "500\|error\|permission" | tail -10

echo ""
echo "6️⃣ Vérification des logs d'accès..."
sudo tail -10 /var/log/nginx/access.log | grep "GET /"

echo ""
echo "7️⃣ Test de lecture du fichier index.html..."
sudo cat /var/www/kaolack/dist/index.html 2>/dev/null | head -5 || echo "❌ Impossible de lire index.html"

echo ""
echo "✅ Diagnostic terminé"
