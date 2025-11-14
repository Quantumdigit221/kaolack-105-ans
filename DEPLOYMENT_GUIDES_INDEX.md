# 📑 Deployment Guides Index - Kaolack Stories Connect

**Project**: Kaolack Stories Connect  
**Domain**: kaolackcommune.sn  
**Last Updated**: November 13, 2025  
**Repository**: https://github.com/Quantumdigit221/kaolack-105-ans

---

## 🎯 Choose Your Deployment Platform

### 🌩️ **Option 1: Hostinger cPanel (Shared Hosting)** ⭐ RECOMMENDED

Perfect for: Small to medium traffic, managed hosting, easy setup

**Quick Links:**
- **⚡ 5-Minute Quick Start**: [CPANEL_QUICKSTART.md](CPANEL_QUICKSTART.md)
- **📚 Complete Guide**: [CPANEL_DEPLOYMENT_GUIDE.md](CPANEL_DEPLOYMENT_GUIDE.md)
- **🚀 Deployment Script**: `deploy-cpanel.sh`

**Setup Time**: 5-15 minutes  
**Cost**: ~$10-30/month (Hostinger plans)  
**Maintenance**: Minimal

**What's Included:**
✅ React frontend auto-deployment  
✅ Express API auto-deployment  
✅ MySQL database setup  
✅ SSL certificate (auto-renewing)  
✅ PM2 process management  
✅ Auto-restart on reboot  

---

### 🐳 **Option 2: Ubuntu VPS with Docker** (Advanced)

Perfect for: High traffic, custom configuration, full control

**Quick Links:**
- **⚡ 5-Minute Quick Start**: [QUICKSTART_VPS.md](QUICKSTART_VPS.md)
- **📚 Step-by-Step Guide**: [STEP_BY_STEP_DEPLOYMENT.md](STEP_BY_STEP_DEPLOYMENT.md)
- **📖 Complete Documentation**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md)
- **🚀 Deployment Script**: `deploy.sh`

**Setup Time**: 30 minutes - 2 hours  
**Cost**: $10-100+/month (DigitalOcean, Linode, AWS, etc.)  
**Maintenance**: Moderate to High

**What's Included:**
✅ Docker containerization  
✅ Nginx reverse proxy  
✅ MySQL + Redis  
✅ SSL with Let's Encrypt  
✅ Health checks  
✅ Auto-backups  
✅ Systemd integration  

---

## 📋 Quick Comparison

| Feature | cPanel | VPS Docker |
|---------|--------|-----------|
| Setup Time | 5-15 min | 30-120 min |
| Cost | $10-30/mo | $10-100+/mo |
| Scalability | Limited | Unlimited |
| Control | Medium | Full |
| Maintenance | Minimal | Moderate |
| Recommended Traffic | <1000 req/s | >1000 req/s |
| Database | Included | Custom |
| SSL | Auto | Auto (Let's Encrypt) |
| Backups | Manual | Automated |

---

## 🚀 Choose Your Path

### I want the easiest setup (cPanel)

```
1. Read: CPANEL_QUICKSTART.md (5 min)
2. Run: ./deploy-cpanel.sh (automated)
3. Test: https://kaolackcommune.sn
Done! ✅
```

### I want more control (VPS Docker)

```
1. Read: QUICKSTART_VPS.md (5 min)
2. Follow: STEP_BY_STEP_DEPLOYMENT.md (detailed)
3. Run: ./deploy.sh (automated)
4. Test: https://kaolackcommune.sn
Done! ✅
```

### I want full details (Both)

```
1. Read: DEPLOYMENT_VPS.md (all VPS details)
2. Read: CPANEL_DEPLOYMENT_GUIDE.md (all cPanel details)
3. Compare and choose
4. Deploy with provided script
Done! ✅
```

---

## 📁 File Structure

```
Root Directory
├── 🌩️ cPanel Deployment Files
│   ├── CPANEL_QUICKSTART.md ..................... 5-min quick start
│   ├── CPANEL_DEPLOYMENT_GUIDE.md ............. Complete guide
│   ├── deploy-cpanel.sh ........................ Automated script
│   └── .env.cpanel.example ..................... Config template
│
├── 🐳 VPS Docker Deployment Files
│   ├── QUICKSTART_VPS.md ........................ 5-min quick start
│   ├── STEP_BY_STEP_DEPLOYMENT.md ............. Detailed guide
│   ├── DEPLOYMENT_VPS.md ........................ Complete reference
│   ├── VPS_DEPLOYMENT_INDEX.md ................. File index
│   ├── VPS_DEPLOYMENT_SUMMARY.md ............... Overview
│   ├── README_VPS_DEPLOYMENT.md ................ Main entry
│   ├── deploy.sh ............................... Deployment script
│   ├── test-deployment.sh ...................... Testing script
│   ├── docker-compose.yml ...................... Container orchestration
│   ├── backend/Dockerfile ...................... Backend image
│   ├── frontend.Dockerfile ..................... Frontend image
│   ├── nginx.conf .............................. Web server config
│   └── .env.vps.example ........................ VPS config template
│
├── 🔧 Configuration Files
│   ├── .env.production ......................... Production config
│   └── .env.cpanel.example ..................... cPanel template
│
├── 📚 Source Code
│   ├── src/ .................................... React frontend
│   ├── backend/ ................................ Express API
│   ├── database/ ............................... Database schema
│   └── package.json ............................ Dependencies
```

---

## 🔒 Security Checklist (All Platforms)

**Before Going Live:**

- [ ] Database password is strong (20+ chars, mixed)
- [ ] JWT_SECRET generated with `openssl rand -base64 32`
- [ ] SESSION_SECRET generated with `openssl rand -base64 32`
- [ ] SSL certificate installed and auto-renewing
- [ ] `.env` file has restrictive permissions (600 or 400)
- [ ] SMTP configured or disabled properly
- [ ] CORS origin set to correct domain
- [ ] Admin account created and tested
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database backups working
- [ ] Firewall rules reviewed

---

## 📊 Domain Configuration

### Primary Domain: kaolackcommune.sn
- **Frontend URL**: https://kaolackcommune.sn
- **Admin URL**: https://www.kaolackcommune.sn
- **Documentation**: kaolackcommune.sn/docs (if configured)

### API Subdomain: api.kaolackcommune.sn
- **API Base**: https://api.kaolackcommune.sn/api
- **Health Check**: https://api.kaolackcommune.sn/api/health

---

## 🧪 Post-Deployment Testing

### Test Frontend
```bash
# Should return HTML (SPA)
curl -I https://kaolackcommune.sn

# Check SPA routing
curl -I https://kaolackcommune.sn/admin
curl -I https://kaolackcommune.sn/posts
```

### Test API
```bash
# Health check
curl https://api.kaolackcommune.sn/api/health

# Get posts
curl https://api.kaolackcommune.sn/api/posts

# Login test
curl -X POST https://api.kaolackcommune.sn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Check SSL
```bash
# Verify certificate
curl -I https://kaolackcommune.sn | grep -i ssl

# Test both domains
curl -I https://api.kaolackcommune.sn
```

---

## 🔄 Maintenance & Monitoring

### Daily
```bash
# cPanel: Check PM2 status
pm2 status

# VPS: Check Docker containers
docker-compose ps
```

### Weekly
```bash
# Check logs for errors
# cPanel: pm2 logs kaolack-api
# VPS: docker-compose logs backend

# Check disk usage
df -h
```

### Monthly
```bash
# Update dependencies
npm update

# Backup database
mysqldump -u user -p database > backup.sql

# Check SSL certificate expiry
# Should auto-renew on both platforms
```

---

## 🚨 Emergency Procedures

### Application Down (cPanel)
```bash
ssh user@server
pm2 restart kaolack-api
pm2 logs kaolack-api  # Check error
```

### Application Down (VPS)
```bash
ssh root@server
cd /var/www/kaolack
docker-compose restart backend
docker-compose logs backend  # Check error
```

### Database Error
```bash
# cPanel
mysql -u kaolack_user -p kaolack_db

# VPS
docker-compose exec mysql mysql -u kaolack_user -p kaolack_db
```

### SSL Certificate Issue
```bash
# cPanel: Use AutoSSL in cPanel dashboard
# VPS: certbot renew --force-renewal
```

---

## 📞 Getting Help

### Check Documentation First
1. **Quick issue?** → Check relevant quickstart guide
2. **Detailed problem?** → Read full deployment guide
3. **Not found?** → Check troubleshooting section
4. **Still stuck?** → See deployment script logs

### Useful Commands

**cPanel:**
```bash
pm2 status          # Check app status
pm2 logs kaolack-api  # View logs
pm2 restart kaolack-api  # Restart app
nano ~/backend/.env  # Edit config
```

**VPS:**
```bash
docker-compose ps    # Check containers
docker-compose logs backend  # View logs
docker-compose restart backend  # Restart app
nano .env.production  # Edit config
```

---

## 🎯 Next Steps

### Immediate (After Deployment)
1. ✅ Test all pages load
2. ✅ Verify API responds
3. ✅ Check SSL certificate
4. ✅ Review error logs

### First Week
1. Configure monitoring/alerts
2. Setup automated backups
3. Enable email notifications
4. Document any customizations

### First Month
1. Performance analysis
2. Security audit
3. Disaster recovery test
4. Plan for scaling

---

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| **CPANEL_QUICKSTART.md** | 5-min quick start for cPanel | 5 min |
| **CPANEL_DEPLOYMENT_GUIDE.md** | Complete cPanel guide | 30 min |
| **QUICKSTART_VPS.md** | 5-min quick start for VPS | 5 min |
| **STEP_BY_STEP_DEPLOYMENT.md** | Detailed VPS guide | 45 min |
| **DEPLOYMENT_VPS.md** | Complete VPS reference | 60 min |
| **VPS_DEPLOYMENT_INDEX.md** | File navigation | 10 min |
| **VPS_DEPLOYMENT_SUMMARY.md** | Package overview | 5 min |
| **README_VPS_DEPLOYMENT.md** | VPS main entry | 15 min |
| **DEPLOYMENT_GUIDES_INDEX.md** | This file | 10 min |

---

## ✅ Deployment Status

**Latest Update**: November 13, 2025  
**Commit**: 54e5a73  

### Updated Files (This Release)
- ✅ Domain updated: mairiekaolack.sn → kaolackcommune.sn
- ✅ Configuration files updated
- ✅ cPanel deployment guide created (comprehensive)
- ✅ cPanel quick start created
- ✅ cPanel deployment script created
- ✅ cPanel environment template created
- ✅ All documentation updated with new domain
- ✅ Git commit and push completed

### Ready to Deploy
✅ cPanel (Hostinger) - **READY**  
✅ VPS (Docker) - **READY**  
✅ Configuration Templates - **READY**  
✅ Testing Guides - **READY**  
✅ Documentation - **COMPLETE**  

---

## 🎉 Ready to Deploy!

Choose your platform above and follow the quick start guide.

**Questions?** Check the detailed guide for your platform.

**Ready?** Let's get it live! 🚀

---

**Repository**: https://github.com/Quantumdigit221/kaolack-105-ans  
**Issues**: https://github.com/Quantumdigit221/kaolack-105-ans/issues  
**Discussions**: https://github.com/Quantumdigit221/kaolack-105-ans/discussions
