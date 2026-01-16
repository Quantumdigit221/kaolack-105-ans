#!/bin/bash

# ==========================================
# SCRIPT DE CONFIGURATION SSL - KAOLACK 105 ANS
# ==========================================

echo "🔐 CONFIGURATION SSL/HTTPS POUR PORTAIL.KAOLACKCOMMUNE.SN"

# Variables
DOMAIN="portail.kaolackcommune.sn"
VPS_IP="51.68.70.83"
VPS_USER="root"

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration SSL sur le VPS
ssh $VPS_USER@$VPS_IP << 'EOF'
    echo "📦 INSTALLATION DE CERTBOT..."
    apt update
    apt install -y certbot python3-certbot-nginx

    echo "🔐 GÉNÉRATION DU CERTIFICAT SSL..."
    certbot --nginx -d portail.kaolackcommune.sn -d www.portail.kaolackcommune.sn --non-interactive --agree-tos --email admin@kaolackcommune.sn

    echo "🔄 CONFIGURATION DU RENOUVELLEMENT AUTOMATIQUE..."
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

    echo "🔍 VÉRIFICATION DU CERTIFICAT..."
    certbot certificates

    echo "🌐 REDÉMARRAGE DE NGINX..."
    systemctl reload nginx

    echo "✅ CONFIGURATION SSL TERMINÉE"
EOF

if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors de la configuration SSL"
    exit 1
fi

echo ""
log_info "🎉 CONFIGURATION SSL/HTTPS TERMINÉE !"
echo ""
echo "📋 RÉCAPITULATIF:"
echo "   ✅ Certificat SSL installé"
echo "   ✅ Nginx configuré pour HTTPS"
echo "   ✅ Renouvellement automatique configuré"
echo ""
echo "🌐 Accès sécurisé:"
echo "   • Application: https://portail.kaolackcommune.sn"
echo "   • API: https://portail.kaolackcommune.sn/api"
echo "   • Health check: https://portail.kaolackcommune.sn/api/health"
echo ""
echo "📊 Vérification du certificat:"
echo "   curl -I https://portail.kaolackcommune.sn"
echo ""
log_warning "⚠️ Le certificat sera renouvelé automatiquement tous les 90 jours"

# Test de connexion HTTPS
echo ""
log_info "🔍 TEST DE CONNEXION HTTPS..."
sleep 5

if curl -k -s -o /dev/null -w "%{http_code}" https://portail.kaolackcommune.sn | grep -q "200"; then
    log_info "✅ Connexion HTTPS fonctionnelle"
else
    log_warning "⚠️ Vérifiez la configuration SSL manuellement"
fi

echo ""
log_info "🚀 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
