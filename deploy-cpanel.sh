#!/bin/bash

# ========================================
# 🚀 Kaolack Stories Connect - cPanel Deployment Script
# ========================================
# Platform: Hostinger cPanel Shared Hosting
# Domain: kaolackcommune.sn
# Usage: ./deploy-cpanel.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="kaolackcommune.sn"
API_DOMAIN="api.kaolackcommune.sn"
REPO_URL="https://github.com/Quantumdigit221/kaolack-105-ans.git"
HOME_DIR="$HOME"
PUBLIC_HTML="$HOME_DIR/public_html"
BACKEND_DIR="$HOME_DIR/backend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 cPanel Deployment - Kaolack Stories Connect${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ========================================
# Phase 1: Pre-deployment Checks
# ========================================
echo -e "${YELLOW}📋 Phase 1: Pre-deployment Checks${NC}"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please enable Node.js in your Hostinger cPanel"
    echo "Or contact Hostinger support to install it"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Git available${NC}"

# Check MySQL access
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL client not found (may be okay if database is pre-configured)${NC}"
else
    echo -e "${GREEN}✓ MySQL client available${NC}"
fi

echo ""

# ========================================
# Phase 2: Build Frontend
# ========================================
echo -e "${YELLOW}📦 Phase 2: Building Frontend${NC}"
echo ""

cd "$HOME_DIR"

if [ -d "kaolack" ]; then
    echo -e "${BLUE}📂 Updating existing repository...${NC}"
    cd kaolack
    git pull origin main
else
    echo -e "${BLUE}📂 Cloning repository...${NC}"
    git clone "$REPO_URL" kaolack
    cd kaolack
fi

echo -e "${BLUE}🔨 Installing frontend dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${BLUE}🏗️ Building React application...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! dist/ directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# ========================================
# Phase 3: Deploy Frontend to public_html
# ========================================
echo -e "${YELLOW}📂 Phase 3: Deploying Frontend${NC}"
echo ""

# Backup existing public_html
if [ -d "$PUBLIC_HTML" ] && [ "$(ls -A $PUBLIC_HTML)" ]; then
    BACKUP_DIR="$PUBLIC_HTML.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}💾 Backing up existing public_html to $BACKUP_DIR...${NC}"
    mv "$PUBLIC_HTML" "$BACKUP_DIR"
fi

# Create fresh public_html
mkdir -p "$PUBLIC_HTML"

echo -e "${BLUE}📋 Copying frontend files...${NC}"
cp -r dist/* "$PUBLIC_HTML/"

# Create .htaccess for React Router and security
echo -e "${BLUE}⚙️ Creating .htaccess configuration...${NC}"
cat > "$PUBLIC_HTML/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Force HTTPS
  RewriteCond %{HTTPS} !=on
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # React Router: serve index.html for all non-file/non-directory requests
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-UA-Compatible "IE=edge"
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType application/javascript "access plus 30 days"
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/gif "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType font/woff "access plus 30 days"
  ExpiresByType font/woff2 "access plus 30 days"
</IfModule>
EOF

chmod 644 "$PUBLIC_HTML/.htaccess"
echo -e "${GREEN}✓ Frontend deployed${NC}"
echo ""

# ========================================
# Phase 4: Deploy Backend
# ========================================
echo -e "${YELLOW}🔧 Phase 4: Deploying Backend${NC}"
echo ""

# Create backend directory
mkdir -p "$BACKEND_DIR"

echo -e "${BLUE}📋 Copying backend files...${NC}"
cp -r "$HOME_DIR/kaolack/backend"/* "$BACKEND_DIR/"

# Create uploads directory
mkdir -p "$BACKEND_DIR/uploads"
mkdir -p "$BACKEND_DIR/logs"

echo -e "${BLUE}🔨 Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --production

echo -e "${GREEN}✓ Backend files deployed${NC}"
echo ""

# ========================================
# Phase 5: Environment Configuration
# ========================================
echo -e "${YELLOW}⚙️ Phase 5: Environment Configuration${NC}"
echo ""

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${BLUE}📝 Creating .env file from template...${NC}"
    cp "$HOME_DIR/kaolack/.env.cpanel.example" "$BACKEND_DIR/.env"
    
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit $BACKEND_DIR/.env with your values:${NC}"
    echo -e "${YELLOW}   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME${NC}"
    echo -e "${YELLOW}   - JWT_SECRET (generate: openssl rand -base64 32)${NC}"
    echo -e "${YELLOW}   - SESSION_SECRET (generate: openssl rand -base64 32)${NC}"
    echo -e "${YELLOW}   - SMTP credentials (optional)${NC}"
    echo ""
    echo -e "${BLUE}Edit with: nano $BACKEND_DIR/.env${NC}"
    echo ""
    
    read -p "Have you edited .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Please edit .env before continuing${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}📝 .env file already exists${NC}"
    echo -e "${YELLOW}Verify values are correct: nano $BACKEND_DIR/.env${NC}"
fi

chmod 600 "$BACKEND_DIR/.env"
echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# ========================================
# Phase 6: Install PM2 Process Manager
# ========================================
echo -e "${YELLOW}📊 Phase 6: Setting up Process Manager${NC}"
echo ""

echo -e "${BLUE}📦 Installing PM2 globally...${NC}"
npm install -g pm2

# Create PM2 ecosystem config
echo -e "${BLUE}⚙️ Creating PM2 configuration...${NC}"
cat > "$BACKEND_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'kaolack-api',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['logs', 'uploads', 'node_modules'],
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

echo -e "${BLUE}🚀 Starting application with PM2...${NC}"
cd "$BACKEND_DIR"
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save
pm2 startup

echo -e "${GREEN}✓ PM2 configured${NC}"
echo ""

# ========================================
# Phase 7: Database Setup
# ========================================
echo -e "${YELLOW}🗄️ Phase 7: Database Setup${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: Database setup${NC}"
echo "You need to:"
echo "1. Create MySQL database in cPanel"
echo "2. Create MySQL user with privileges"
echo "3. Copy credentials to $BACKEND_DIR/.env"
echo "4. Run: mysql -h localhost -u USERNAME -p DATABASE < ~/kaolack/database/schema.sql"
echo ""

read -p "Database already setup and .env updated? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please setup database first, then run this script again${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database configuration noted${NC}"
echo ""

# ========================================
# Phase 8: Verify Deployment
# ========================================
echo -e "${YELLOW}✅ Phase 8: Verification${NC}"
echo ""

echo -e "${BLUE}Checking application status...${NC}"
pm2 status

echo ""
echo -e "${BLUE}Checking logs (last 10 lines)...${NC}"
pm2 logs kaolack-api --lines 10 --nostream

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}🌐 Frontend: ${NC}https://$DOMAIN"
echo -e "${BLUE}🔌 Backend: ${NC}https://$API_DOMAIN/api"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Test frontend: https://$DOMAIN"
echo "2. Test API: https://$API_DOMAIN/api/health"
echo "3. Monitor logs: pm2 logs kaolack-api"
echo "4. Manage app: pm2 status"
echo ""

echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "  pm2 status              # Check application status"
echo "  pm2 logs kaolack-api    # View logs in real-time"
echo "  pm2 restart kaolack-api # Restart application"
echo "  pm2 stop kaolack-api    # Stop application"
echo "  pm2 delete kaolack-api  # Remove from PM2"
echo ""

echo -e "${YELLOW}📝 Documentation:${NC}"
echo "Read: CPANEL_DEPLOYMENT_GUIDE.md for troubleshooting and optimization"
echo ""
