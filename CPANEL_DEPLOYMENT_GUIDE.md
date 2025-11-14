# 🚀 cPanel Deployment Guide - Kaolack Stories Connect

**Last Updated**: November 13, 2025  
**Platform**: Hostinger cPanel Shared Hosting  
**Status**: ✅ Production Ready  
**Domain**: kaolackcommune.sn  
**GitHub**: https://github.com/Quantumdigit221/kaolack-105-ans

---

## 📖 Table of Contents

1. [Quick Start (5 minutes)](#quick-start-5-minutes)
2. [Prerequisites & Requirements](#prerequisites--requirements)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Domain & SSL Configuration](#domain--ssl-configuration)
7. [Database Setup](#database-setup)
8. [Troubleshooting](#troubleshooting)
9. [Performance Optimization](#performance-optimization)

---

## ⚡ Quick Start (5 minutes)

### Prerequisites
- ✅ Hostinger cPanel account with Node.js support
- ✅ SSH access enabled
- ✅ Domain configured (kaolackcommune.sn)
- ✅ MySQL database included in plan

### 3-Step Setup

**Step 1**: Clone repository and build
```bash
ssh user@your-cpanel-server.com
cd ~/public_html
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git .
npm run build
```

**Step 2**: Copy files to correct locations
```bash
# Frontend to public folder
cp -r dist/* public_html/

# Backend to separate folder (outside public_html)
mkdir -p ~/backend
cp -r backend/* ~/backend/
cd ~/backend && npm install --production
```

**Step 3**: Configure environment & start
```bash
cp .env.cpanel.example ~/backend/.env
nano ~/backend/.env  # Edit with your details
```

**That's it!** Your app is now deployed.

---

## 📋 Prerequisites & Requirements

### cPanel Account Specifications

| Requirement | Hostinger cPanel |
|-------------|------------------|
| **SSH Access** | ✅ Required (enabled in cPanel) |
| **Node.js Support** | ✅ Required (typically v16-20) |
| **MySQL** | ✅ Required (v5.7 or 8.0+) |
| **Disk Space** | ~1GB minimum |
| **Memory** | Shared hosting sufficient |
| **SSL Certificate** | ✅ Included (AutoSSL/Let's Encrypt) |

### Hostinger cPanel Features Needed

- ✅ File Manager or FTP/SSH access
- ✅ MySQL Databases manager
- ✅ AutoInstaller (optional but helpful)
- ✅ SSL/TLS manager
- ✅ Addon Domains (for api.kaolackcommune.sn)

---

## 🔧 Step-by-Step Deployment

### Phase 1: Initial Setup (10 minutes)

#### 1.1 Access via SSH
```bash
ssh cpaneluser@your-server.com
# Or use terminal in cPanel File Manager
```

#### 1.2 Navigate to home directory
```bash
cd ~
pwd  # Should show: /home/username
```

#### 1.3 Clone repository
```bash
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git kaolack
cd kaolack
```

#### 1.4 Check Node.js version
```bash
node -v  # Should be v16+ (ideally v18 or v20)
npm -v   # Should be v8+
```

**If Node.js not available:**
- Use cPanel AutoInstaller (if available)
- Or contact Hostinger support to enable Node.js

### Phase 2: Frontend Deployment (15 minutes)

#### 2.1 Build frontend
```bash
cd ~/kaolack
npm install --legacy-peer-deps  # If needed
npm run build
```

**Success indicator**: `dist/` folder created with `index.html`

#### 2.2 Deploy to public_html
```bash
# Clear existing public_html (backup first!)
mv ~/public_html ~/public_html_backup
mkdir ~/public_html

# Copy built files
cp -r dist/* ~/public_html/

# Create .htaccess for React Router
cat > ~/public_html/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Remove .html extension
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.html [QSA,L]
  
  # SSL redirect
  RewriteCond %{HTTPS} !=on
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Security headers
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
</IfModule>
EOF
```

#### 2.3 Verify frontend
```bash
curl https://kaolackcommune.sn
# Should return HTML content
```

---

### Phase 3: Backend Deployment (20 minutes)

#### 3.1 Create backend directory outside public_html
```bash
mkdir -p ~/backend
cd ~/backend
```

#### 3.2 Copy backend files
```bash
cp -r ~/kaolack/backend/* ./
npm install --production  # Install dependencies only
```

#### 3.3 Create .env file
```bash
cp ~/kaolack/.env.cpanel.example .env
nano .env  # Edit with your values

# Key values to set:
# - DB_HOST: localhost
# - DB_USER: Your MySQL username (from cPanel)
# - DB_PASSWORD: Your MySQL password
# - DB_NAME: Your database name
# - JWT_SECRET: Generate with: openssl rand -base64 32
# - SESSION_SECRET: Generate with: openssl rand -base64 32
```

#### 3.4 Setup PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 config
cat > ecosystem.config.js << 'EOF'
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
      max_memory_restart: '500M'
    }
  ]
};
EOF

# Start the application
pm2 start ecosystem.config.js
pm2 save  # Save PM2 process list
pm2 startup  # Auto-start on reboot
```

#### 3.5 Verify backend is running
```bash
pm2 logs kaolack-api  # View logs
pm2 status  # Check status

# Test the API
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}
```

---

### Phase 4: Domain & Subdomain Configuration

#### 4.1 Configure main domain (kaolackcommune.sn)
**In cPanel:**
1. Go to **Addon Domains** (or **Parked Domains**)
2. Add domain: `kaolackcommune.sn`
3. Set document root: `public_html`
4. Save

#### 4.2 Configure API subdomain (api.kaolackcommune.sn)
**In cPanel:**
1. Go to **Subdomains**
2. Create subdomain:
   - Subdomain: `api`
   - Domain: `kaolackcommune.sn`
   - Document root: `backend` (or custom folder)
3. Save

#### 4.3 Configure Apache reverse proxy for API
```bash
# Create .htaccess in your backend document root
cat > ~/.htaccess-api << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Reverse proxy to Node.js backend
  RewriteRule ^(.*)$ http://localhost:3001/$1 [P,QSA,L]
</IfModule>

# Note: This requires Apache mod_proxy enabled
# If not working, contact Hostinger support to enable mod_proxy
EOF
```

---

### Phase 5: SSL Certificate Configuration

#### 5.1 Auto-generate SSL (Hostinger)
**In cPanel:**
1. Go to **AutoSSL** or **Let's Encrypt SSL**
2. Check both domains:
   - `kaolackcommune.sn`
   - `api.kaolackcommune.sn`
3. Click "Auto Install"
4. Wait ~5 minutes

#### 5.2 Force HTTPS redirect
Already included in `.htaccess` file above.

#### 5.3 Verify SSL
```bash
curl -I https://kaolackcommune.sn
curl -I https://api.kaolackcommune.sn
# Should show: HTTP/2 200 and certificate info
```

---

## 🗄️ Database Setup

### Step 1: Create MySQL Database

**In cPanel:**
1. Go to **MySQL Databases**
2. Create new database:
   - Name: `kaolack_db`
   - Username: `kaolack_user`
   - Password: (strong password - save it!)
3. Add user to database with all privileges
4. Copy credentials

### Step 2: Import Database Structure

```bash
# Download dump from repository
cd ~/kaolack
mysql -h localhost -u kaolack_user -p kaolack_db < database/schema.sql

# When prompted, enter your database password
```

### Step 3: Run Migrations (Optional)

```bash
cd ~/backend
npm run migrate  # If you have migration scripts
# Or manually run them via backend API
```

### Step 4: Verify Database

```bash
mysql -h localhost -u kaolack_user -p kaolack_db
# Type password when prompted
# Then in MySQL:
SHOW TABLES;
EXIT;
```

---

## 🌐 Environment Configuration

### Update .env.cpanel.example

Create `.env.cpanel.example` in root:

```bash
# ========================================
# 🚀 CONFIGURATION CPANEL - HOSTINGER
# ========================================

# Frontend (React/Vite)
VITE_API_URL=https://api.kaolackcommune.sn/api
VITE_APP_NAME=Kaolack Stories Connect
VITE_APP_VERSION=1.0.0

# Backend (Node.js/Express)
NODE_ENV=production
PORT=3001
HOST=127.0.0.1

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=kaolack_user
DB_PASSWORD=YOUR_DB_PASSWORD  # CHANGE THIS!
DB_NAME=kaolack_db
DB_CHARSET=utf8mb4
DB_TIMEZONE=+00:00

# JWT & Security
JWT_SECRET=GENERATE_WITH_openssl_rand_-base64_32
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# Upload Files
UPLOAD_DIR=/home/username/backend/uploads
MAX_FILE_SIZE=50000000

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@kaolackcommune.sn

# URLs
APP_URL=https://kaolackcommune.sn
API_URL=https://api.kaolackcommune.sn
FRONTEND_URL=https://kaolackcommune.sn

# CORS
CORS_ORIGIN=https://kaolackcommune.sn

# Session
SESSION_SECRET=GENERATE_WITH_openssl_rand_-base64_32
SESSION_TIMEOUT=86400

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🧪 Testing Deployment

### Test Frontend
```bash
# Should load in browser
https://kaolackcommune.sn

# Test SPA routing
https://kaolackcommune.sn/admin
https://kaolackcommune.sn/news
# Should all load without 404 errors
```

### Test Backend API
```bash
# Health check
curl https://api.kaolackcommune.sn/api/health

# List posts
curl https://api.kaolackcommune.sn/api/posts

# Login test
curl -X POST https://api.kaolackcommune.sn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### View Logs
```bash
# Backend logs
pm2 logs kaolack-api

# Check PM2 status
pm2 status

# cPanel error logs (via cPanel)
# Logs > Raw Access Logs / Error Logs
```

---

## 🔍 Troubleshooting

### Issue 1: Backend won't start

**Symptoms**: PM2 shows "stopped" or "error"

**Solution**:
```bash
# Check logs
pm2 logs kaolack-api

# Check if port 3001 is in use
lsof -i :3001

# Verify .env file
cat ~/backend/.env | head

# Restart
pm2 restart kaolack-api
```

### Issue 2: Frontend shows blank page

**Symptoms**: Browser shows blank or 404

**Solution**:
```bash
# Verify .htaccess exists
ls -la ~/public_html/.htaccess

# Check .htaccess syntax
# Or re-create it (see Phase 2 above)

# Check file permissions
chmod 644 ~/public_html/.htaccess
chmod 755 ~/public_html
```

### Issue 3: API returns 502/503 error

**Symptoms**: "Bad Gateway" or "Service Unavailable"

**Solution**:
```bash
# Check if backend is running
pm2 status

# Restart backend
pm2 restart kaolack-api

# Check database connection
mysql -h localhost -u kaolack_user -p kaolack_db -e "SELECT 1;"

# Verify mod_proxy is enabled (in cPanel or via .htaccess)
```

### Issue 4: SSL certificate not working

**Symptoms**: Browser warning about self-signed certificate

**Solution**:
```bash
# Check SSL status in cPanel
# Go to SSL/TLS Status

# Re-issue certificate
# Or install manually via cPanel > AutoSSL

# Force HTTPS (already in .htaccess)
```

### Issue 5: Database connection fails

**Symptoms**: "Connection refused" or "Access denied"

**Solution**:
```bash
# Verify credentials in .env
nano ~/backend/.env

# Test connection directly
mysql -h localhost -u kaolack_user -p kaolack_db

# If fails, verify in cPanel:
# MySQL Databases > Check user privileges
```

---

## ⚙️ Performance Optimization

### 1. Enable Compression
```bash
# Already in .htaccess, verify:
# mod_deflate should be enabled in cPanel
```

### 2. Setup Caching
```bash
# Browser caching (in .htaccess)
# Already configured - 30 days for static files

# API response caching
# Can be added to backend routes
```

### 3. Optimize Database
```bash
# Connect via MySQL client
mysql -h localhost -u kaolack_user -p kaolack_db

# Check indexes
SHOW INDEX FROM posts;
SHOW INDEX FROM users;

# Add indexes if missing
ALTER TABLE posts ADD INDEX idx_user_id (user_id);
ALTER TABLE comments ADD INDEX idx_post_id (post_id);
```

### 4. Optimize Node.js
In `ecosystem.config.js`, adjust:
```javascript
instances: 'max',  // Use all available cores
max_memory_restart: '400M'  // Restart if >400MB
```

### 5. Monitor Memory Usage
```bash
# Check current memory
pm2 monit

# Or via SSH
free -h
```

---

## 🔒 Security Checklist

Before going live, ensure:

- [ ] Strong database password set
- [ ] JWT_SECRET generated (not default)
- [ ] SESSION_SECRET generated (not default)
- [ ] SSL certificate installed and auto-renewing
- [ ] .env file has restrictive permissions (644)
- [ ] Backend directory has proper permissions
- [ ] SMTP credentials configured or disabled
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Admin account created
- [ ] Firewall rules checked in cPanel

---

## 📊 Monitoring & Maintenance

### Daily Checks
```bash
# Check application status
pm2 status

# Check disk usage
df -h

# Check memory
free -h
```

### Weekly Checks
```bash
# Review logs for errors
pm2 logs --lines 100 kaolack-api

# Check database size
mysql -u kaolack_user -p kaolack_db -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) as size FROM information_schema.TABLES WHERE table_schema = 'kaolack_db';"
```

### Monthly Checks
```bash
# Update dependencies
cd ~/backend && npm update

# Backup database
mysqldump -h localhost -u kaolack_user -p kaolack_db > ~/backups/kaolack_db_$(date +%Y%m%d).sql

# Check SSL certificate expiry
curl -I https://kaolackcommune.sn | grep -i expires
```

---

## 🚀 Next Steps

### Immediate (After Deployment)
1. Test all functionality
2. Verify SSL certificate
3. Check error logs
4. Monitor for 24 hours

### First Week
1. Configure email alerts
2. Setup automated backups
3. Enable monitoring tools
4. Document custom configurations

### First Month
1. Performance analysis
2. Security audit
3. Disaster recovery test
4. Update documentation

---

## 📞 Support Resources

### Hostinger cPanel Help
- https://support.hostinger.com/
- Contact support for SSH/Node.js issues

### Documentation in Repository
- `CPANEL_DEPLOYMENT_QUICKSTART.md` - 5-minute guide
- `.env.cpanel.example` - Environment template
- `database/schema.sql` - Database structure

### Monitoring Commands
```bash
# Backend status
pm2 status

# Backend logs
pm2 logs kaolack-api

# Database check
mysql -u kaolack_user -p kaolack_db -e "SELECT COUNT(*) FROM users;"
```

---

## 📝 Version Information

- **Guide Version**: 1.0
- **Created**: November 13, 2025
- **Platform**: Hostinger cPanel
- **Node.js**: v16+ (recommended: v18+)
- **Database**: MySQL 5.7+ or 8.0+
- **SSL**: Let's Encrypt (AutoSSL)

---

## 🎉 Deployment Complete!

Your application is now running on Hostinger cPanel with:

✅ React frontend at kaolackcommune.sn  
✅ Express backend at api.kaolackcommune.sn  
✅ SSL certificates (AutoSSL)  
✅ MySQL database  
✅ PM2 process management  
✅ Auto-restart on reboot  
✅ Performance optimization  
✅ Security headers  

**Monitor your application and enjoy!** 🚀

---

**Questions?** Check the troubleshooting section or contact Hostinger support.
