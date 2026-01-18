#!/bin/bash

# ========================================
# 🧪 Script de Test du Déploiement
# ========================================
# Utilisation: ./test-deployment.sh

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="https://portail.kaolackcommune.sn/api"
FRONTEND_URL="https://portail.kaolackcommune.sn"

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_fail() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# ====================================
# Tests d'accessibilité
# ====================================

test_frontend() {
    log_test "Frontend accessibility"
    
    if curl -s -k "$FRONTEND_URL" | grep -q "Kaolack"; then
        log_pass "Frontend is accessible"
    else
        log_fail "Frontend not accessible or missing content"
        return 1
    fi
}

test_api() {
    log_test "API accessibility"
    
    if curl -s -k "$API_URL/api/health" | grep -q "ok\|healthy"; then
        log_pass "API health check passed"
    else
        log_fail "API health check failed"
        return 1
    fi
}

test_ssl() {
    log_test "SSL/TLS certificates"
    
    # Frontend SSL
    CERT_DATE=$(openssl s_client -connect kaolack.sn:443 -servername kaolack.sn 2>/dev/null | \
        openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
    
    if [ -n "$CERT_DATE" ]; then
        log_pass "Frontend SSL certificate valid until: $CERT_DATE"
    else
        log_fail "Frontend SSL certificate check failed"
        return 1
    fi
    
    # API SSL
    CERT_DATE=$(openssl s_client -connect api.kaolack.sn:443 -servername api.kaolack.sn 2>/dev/null | \
        openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
    
    if [ -n "$CERT_DATE" ]; then
        log_pass "API SSL certificate valid until: $CERT_DATE"
    else
        log_fail "API SSL certificate check failed"
        return 1
    fi
}

# ====================================
# Tests Docker
# ====================================

test_docker_services() {
    log_test "Docker services status"
    
    if ! command -v docker &> /dev/null; then
        log_fail "Docker not installed"
        return 1
    fi
    
    cd /var/www/kaolack || exit 1
    
    # Vérifier chaque service
    for service in mysql redis backend nginx; do
        status=$(docker-compose ps --services --filter "status=running" | grep -c "$service" || true)
        if [ "$status" -gt 0 ]; then
            log_pass "Docker service '$service' is running"
        else
            log_fail "Docker service '$service' is not running"
            return 1
        fi
    done
}

test_docker_health() {
    log_test "Docker containers health"
    
    cd /var/www/kaolack || exit 1
    
    # MySQL
    if docker-compose exec -T mysql mysql -u root -proot_password_change_me -e "SELECT 1;" &>/dev/null; then
        log_pass "MySQL is healthy"
    else
        log_fail "MySQL health check failed"
        return 1
    fi
    
    # Redis
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_pass "Redis is healthy"
    else
        log_fail "Redis health check failed"
        return 1
    fi
}

# ====================================
# Tests de base de données
# ====================================

test_database() {
    log_test "Database connectivity and structure"
    
    cd /var/www/kaolack || exit 1
    
    # Vérifier les tables principales
    tables=$(docker-compose exec -T mysql mysql -u kaolack_user -pchange_me_in_production kaolack_db -e \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='kaolack_db';" 2>/dev/null)
    
    if [ -n "$tables" ] && [ "$tables" -gt 0 ]; then
        log_pass "Database has $tables tables"
    else
        log_fail "Database check failed or no tables found"
        return 1
    fi
}

# ====================================
# Tests de sécurité
# ====================================

test_security_headers() {
    log_test "Security headers"
    
    headers=$(curl -s -k -I "$FRONTEND_URL" | grep -i "Strict-Transport-Security")
    if [ -n "$headers" ]; then
        log_pass "HSTS header is set"
    else
        log_warn "HSTS header not found"
    fi
    
    headers=$(curl -s -k -I "$FRONTEND_URL" | grep -i "X-Frame-Options")
    if [ -n "$headers" ]; then
        log_pass "X-Frame-Options header is set"
    else
        log_warn "X-Frame-Options header not found"
    fi
    
    headers=$(curl -s -k -I "$FRONTEND_URL" | grep -i "X-Content-Type-Options")
    if [ -n "$headers" ]; then
        log_pass "X-Content-Type-Options header is set"
    else
        log_warn "X-Content-Type-Options header not found"
    fi
}

test_cors() {
    log_test "CORS configuration"
    
    cors=$(curl -s -k -I -X OPTIONS "$API_URL/api/" -H "Origin: https://kaolack.sn" | \
        grep -i "Access-Control-Allow-Origin")
    
    if [ -n "$cors" ]; then
        log_pass "CORS is properly configured"
    else
        log_warn "CORS might not be properly configured"
    fi
}

# ====================================
# Tests de performance
# ====================================

test_response_time() {
    log_test "Response times"
    
    start=$(date +%s%N)
    curl -s -k "$FRONTEND_URL" > /dev/null
    end=$(date +%s%N)
    frontend_time=$((($end - $start) / 1000000))
    
    if [ "$frontend_time" -lt 5000 ]; then
        log_pass "Frontend response time: ${frontend_time}ms"
    else
        log_warn "Frontend response time is slow: ${frontend_time}ms"
    fi
    
    start=$(date +%s%N)
    curl -s -k "$API_URL/api/health" > /dev/null
    end=$(date +%s%N)
    api_time=$((($end - $start) / 1000000))
    
    if [ "$api_time" -lt 1000 ]; then
        log_pass "API response time: ${api_time}ms"
    else
        log_warn "API response time is slow: ${api_time}ms"
    fi
}

# ====================================
# Tests des logs
# ====================================

test_logs() {
    log_test "Application logs"
    
    cd /var/www/kaolack || exit 1
    
    # Vérifier les erreurs récentes
    errors=$(docker-compose logs backend 2>/dev/null | grep -i "error" | wc -l)
    
    if [ "$errors" -eq 0 ]; then
        log_pass "No recent errors in backend logs"
    else
        log_warn "Found $errors error(s) in backend logs"
    fi
}

# ====================================
# Menu principal
# ====================================

main() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║   🧪 Test Déploiement Kaolack VPS         ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
    
    total_tests=0
    passed_tests=0
    
    echo ""
    echo -e "${BLUE}📋 Accessibility Tests${NC}"
    test_frontend && ((passed_tests++)) || true
    ((total_tests++))
    
    test_api && ((passed_tests++)) || true
    ((total_tests++))
    
    test_ssl && ((passed_tests++)) || true
    ((total_tests++))
    
    echo ""
    echo -e "${BLUE}🐳 Docker Tests${NC}"
    test_docker_services && ((passed_tests++)) || true
    ((total_tests++))
    
    test_docker_health && ((passed_tests++)) || true
    ((total_tests++))
    
    echo ""
    echo -e "${BLUE}💾 Database Tests${NC}"
    test_database && ((passed_tests++)) || true
    ((total_tests++))
    
    echo ""
    echo -e "${BLUE}🔐 Security Tests${NC}"
    test_security_headers && ((passed_tests++)) || true
    ((total_tests++))
    
    test_cors && ((passed_tests++)) || true
    ((total_tests++))
    
    echo ""
    echo -e "${BLUE}⚡ Performance Tests${NC}"
    test_response_time && ((passed_tests++)) || true
    ((total_tests++))
    
    echo ""
    echo -e "${BLUE}📊 Logs Tests${NC}"
    test_logs && ((passed_tests++)) || true
    ((total_tests++))
    
    echo ""
    echo "═════════════════════════════════════════════"
    echo -e "Tests passed: ${GREEN}$passed_tests${NC}/${total_tests}"
    
    if [ "$passed_tests" -eq "$total_tests" ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
    elif [ "$passed_tests" -gt "$((total_tests / 2))" ]; then
        echo -e "${YELLOW}⚠️  Some tests failed, but deployment seems mostly OK${NC}"
    else
        echo -e "${RED}❌ Multiple test failures detected${NC}"
    fi
    
    echo "═════════════════════════════════════════════"
}

# Exécuter
main "$@"
