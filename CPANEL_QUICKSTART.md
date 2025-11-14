# ⚡ cPanel Quick Start - 5 Minutes

**Platform**: Hostinger cPanel  
**Domain**: kaolackcommune.sn  
**Status**: Deploy in 5 steps

---

## 🚀 Quick Deployment

### Step 1: SSH Access (30 seconds)

```bash
ssh cpaneluser@your-server.com
# Or use Terminal in cPanel File Manager
```

### Step 2: Clone & Build (2 minutes)

```bash
cd ~
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git kaolack
cd kaolack
npm install --legacy-peer-deps
npm run build
```

**Expected**: `dist/` folder created

### Step 3: Copy Frontend (30 seconds)

```bash
# Backup existing
mv ~/public_html ~/public_html.backup

# Deploy
mkdir ~/public_html
cp -r dist/* ~/public_html/
cp CPANEL_DEPLOYMENT_GUIDE.md ../kaolack.html  # For reference

# Create .htaccess
cat > ~/public_html/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{HTTPS} !=on
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
EOF
```

### Step 4: Setup Backend (2 minutes)

```bash
# Copy backend
mkdir ~/backend
cp -r backend/* ~/backend/
cd ~/backend

# Install dependencies
npm install --production

# Create environment
cp ~/.../env.cpanel.example .env
nano .env  # Edit with your DB credentials
```

**Important**: Generate secrets:
```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```

### Step 5: Start Application (30 seconds)

```bash
npm install -g pm2
pm2 start server.js --name kaolack-api
pm2 save
pm2 startup
```

---

## ✅ Verify Deployment

### Test Frontend
```
https://kaolackcommune.sn
```

### Test API
```bash
curl https://api.kaolackcommune.sn/api/health
# Should return: {"status":"ok"}
```

### View Logs
```bash
pm2 logs kaolack-api
```

---

## 📋 Pre-requisites Checklist

- [ ] SSH access to cPanel account
- [ ] Node.js v16+ installed (check: `node -v`)
- [ ] Git installed (check: `git -v`)
- [ ] MySQL database created in cPanel
- [ ] MySQL user created with privileges
- [ ] Domain configured (kaolackcommune.sn)
- [ ] Subdomain for API (api.kaolackcommune.sn)

---

## 🔧 cPanel Configuration

### Database Setup
1. Go to **MySQL Databases**
2. Create: `kaolack_db`
3. Create user: `kaolack_user`
4. Add privileges
5. Note credentials → put in `.env`

### Domain Setup
1. Go to **Addon Domains** → Add `kaolackcommune.sn` → Root: `public_html`
2. Go to **Subdomains** → Create `api` → Root: `backend`
3. Go to **AutoSSL** → Install certificates for both

### Import Database
```bash
mysql -h localhost -u kaolack_user -p kaolack_db < database/schema.sql
# Enter password when prompted
```

---

## 🆘 Quick Troubleshooting

### Backend won't start
```bash
pm2 logs kaolack-api  # Check error
pm2 restart kaolack-api
```

### Frontend shows blank
```bash
# Check .htaccess exists and has correct permissions
ls -la ~/public_html/.htaccess
chmod 644 ~/public_html/.htaccess
```

### API 502 error
```bash
# Check if running
pm2 status

# Test locally
curl http://localhost:3001/api/health
```

### Database connection fails
```bash
# Test MySQL
mysql -h localhost -u kaolack_user -p kaolack_db -e "SELECT 1;"

# Verify .env has correct credentials
cat ~/backend/.env | grep DB_
```

---

## 📚 Full Documentation

See `CPANEL_DEPLOYMENT_GUIDE.md` for:
- Detailed step-by-step guide
- Troubleshooting section
- Performance optimization
- Security checklist
- Monitoring commands

---

## 🎯 What's Working Now

✅ Frontend at kaolackcommune.sn  
✅ Backend API at api.kaolackcommune.sn  
✅ SSL certificates (Auto-renewing)  
✅ MySQL database connected  
✅ PM2 auto-restart on reboot  

---

**Done!** Your app is live. 🚀

Monitor with: `pm2 logs kaolack-api`
