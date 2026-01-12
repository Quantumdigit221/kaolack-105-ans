#!/bin/bash

# Script de débogage pour Nginx sur le VPS

echo "🔍 Diagnostic Nginx..."

echo ""
echo "1️⃣ Vérification du backend sur le port 3001..."
curl -I http://127.0.0.1:3001/api/health 2>&1 | head -5

echo ""
echo "2️⃣ Vérification de toutes les configurations Nginx actives..."
echo "Fichiers dans sites-enabled:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "3️⃣ Configuration complète pour portail.kaolackcommune.sn:"
sudo nginx -T 2>/dev/null | grep -A 50 "server_name portail.kaolackcommune.sn" | head -60

echo ""
echo "4️⃣ Vérification des logs Nginx (dernières erreurs)..."
sudo tail -20 /var/log/nginx/error.log | grep -i "api\|health\|404" || echo "Aucune erreur récente"

echo ""
echo "5️⃣ Test de proxy direct..."
curl -v http://127.0.0.1:3001/api/health 2>&1 | grep -E "HTTP|status|200|404"

echo ""
echo "6️⃣ Vérification des processus Node.js..."
ps aux | grep -E "node|pm2" | grep -v grep

echo ""
echo "✅ Diagnostic terminé"
