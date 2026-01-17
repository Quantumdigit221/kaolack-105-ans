#!/bin/bash

# =========================================
# SCRIPT DE RÉCUPÉRATION D'URGENCE VPS
# =========================================

echo "🚨 RÉCUPÉRATION D'URGENCE - KAOLACK 105 ANS"
echo "=========================================="

# Variables
DEPLOY_DIR="/var/www/kaolack"
DOMAIN="portail.kaolackcommune.sn"

echo "📋 État actuel des services..."
echo "==============================="

# Vérifier PM2
echo "🔍 Processus PM2 :"
pm2 list || echo "PM2 ne répond pas"

# Vérifier les processus Node
echo "🔍 Processus Node.js :"
ps aux | grep node || echo "Aucun processus Node trouvé"

# Vérifier Nginx
echo "🔍 Statut Nginx :"
systemctl status nginx --no-pager || echo "Nginx ne répond pas"

echo ""
echo "🔄 Redémarrage des services..."
echo "============================="

# Arrêter les anciens processus
echo "⏸️ Arrêt des processus Node existants..."
pkill -f "node server.js" || echo "Aucun processus Node à arrêter"
sleep 2

# Démarrer le backend
echo "🚀 Démarrage du backend..."
cd $DEPLOY_DIR/backend

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    npm install --production
fi

# Démarrer avec PM2
echo "🔄 Démarrage avec PM2..."
pm2 start server.js --name "kaolack-backend" --env production
pm2 save

# Redémarrer Nginx
echo "🌐 Redémarrage de Nginx..."
systemctl restart nginx

echo ""
echo "✅ Vérification finale..."
echo "======================="

sleep 3

# Vérifier PM2
echo "📊 Statut PM2 :"
pm2 status

# Vérifier les ports
echo "🔍 Ports en écoute :"
netstat -tlnp | grep -E ":(80|443|3001|3003)"

# Test des endpoints
echo "🌐 Test des endpoints :"
echo "• Slides : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/slides 2>/dev/null || echo "ERREUR")"
echo "• News : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/news 2>/dev/null || echo "ERREUR")"
echo "• Auth/me : $(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/auth/me 2>/dev/null || echo "ERREUR")"

echo ""
echo "🎉 RÉCUPÉRATION TERMINÉE"
echo "========================"
echo "🌐 Site : https://$DOMAIN"
echo "🔧 Logs PM2 : pm2 logs kaolack-backend"
echo "📊 Statut : pm2 status"
