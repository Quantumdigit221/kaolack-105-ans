# 🚀 VPS Ubuntu Deployment - README

**Last Updated**: November 13, 2025  
**Status**: ✅ Production Ready  
**GitHub**: https://github.com/Quantumdigit221/kaolack-105-ans

---

## 📖 Documentation Quick Links

| File | Purpose | Read Time |
|------|---------|-----------|
| **🌟 [QUICKSTART_VPS.md](QUICKSTART_VPS.md)** | 5-step quick start | 10 min |
| **📚 [STEP_BY_STEP_DEPLOYMENT.md](STEP_BY_STEP_DEPLOYMENT.md)** | Complete guide with all commands | 30 min |
| **📋 [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md)** | Full documentation + troubleshooting | Reference |
| **📑 [VPS_DEPLOYMENT_INDEX.md](VPS_DEPLOYMENT_INDEX.md)** | Master index of all files | 10 min |
| **📝 [VPS_DEPLOYMENT_SUMMARY.md](VPS_DEPLOYMENT_SUMMARY.md)** | Package overview | 5 min |

---

## 🎯 Choose Your Path

### Path 1: Quick Deployment (Experienced DevOps)
```bash
# 1. Quick overview
cat QUICKSTART_VPS.md

# 2. Setup
ssh root@your_vps_ip
cd /var/www/kaolack
nano .env.production        # Edit config

# 3. Deploy (5 minutes)
sudo ./deploy.sh

# 4. Test
./test-deployment.sh
```
**Estimated time**: 30 minutes

---

### Path 2: Detailed Deployment (First Time)
```bash
# 1. Read complete guide
cat STEP_BY_STEP_DEPLOYMENT.md

# 2. Follow each phase (8 phases total)
# Phase 1: VPS Preparation
# Phase 2: Docker Installation
# Phase 3: Application Setup
# Phase 4: SSL Configuration
# Phase 5: Deployment
# Phase 6: Testing
# Phase 7: Maintenance
# Phase 8: Final Configuration

# 3. Deploy step by step (follow guide exactly)

# 4. Test each component
```
**Estimated time**: 2-3 hours

---

### Path 3: Help / Troubleshooting
```bash
# Browse the index
cat VPS_DEPLOYMENT_INDEX.md

# Find your issue
cat DEPLOYMENT_VPS.md  # Section 7: Troubleshooting

# Or search GitHub issues
```

---

## 📦 What's Included

### Docker Configuration
✅ `docker-compose.yml` - Complete orchestration  
✅ `backend/Dockerfile` - Backend containerization  
✅ `frontend.Dockerfile` - Frontend containerization  
✅ `nginx.conf` - Web server & SSL configuration  

### Deployment Scripts
✅ `deploy.sh` - Automated deployment  
✅ `test-deployment.sh` - Comprehensive testing  

### Configuration
✅ `.env.production` - Production config (EDIT THIS!)  
✅ `.env.vps.example` - Template reference  

### Documentation
✅ `QUICKSTART_VPS.md` - Quick guide  
✅ `STEP_BY_STEP_DEPLOYMENT.md` - Detailed guide  
✅ `DEPLOYMENT_VPS.md` - Full documentation  
✅ `VPS_DEPLOYMENT_INDEX.md` - File index  
✅ `VPS_DEPLOYMENT_SUMMARY.md` - Package overview  

---

## ⚡ Quick Start (Copy-Paste)

### Prerequisites
- Ubuntu 22.04 or 24.04 VPS
- SSH access
- Domain configured (DNS)

### 3-Step Deployment

**Step 1**: Clone and configure
```bash
git clone https://github.com/Quantumdigit221/kaolack-105-ans.git /var/www/kaolack
cd /var/www/kaolack
cp .env.vps.example .env.production
nano .env.production  # Change values!
```

**Step 2**: Deploy (one command!)
```bash
sudo ./deploy.sh
```

**Step 3**: Verify
```bash
./test-deployment.sh
```

**That's it!** Access:
- Frontend: https://mairiekaolack.sn
- API: https://api.mairiekaolack.sn/api

---

## 🔐 Security Checklist

Before deploying, ensure you:

- [ ] Generated strong DB passwords
- [ ] Generated JWT_SECRET with `openssl rand -base64 32`
- [ ] Generated SESSION_SECRET with `openssl rand -base64 32`
- [ ] Configured your domain DNS
- [ ] Updated email settings (optional)
- [ ] Reviewed `.env.production` for any "CHANGE_ME"
- [ ] Opened firewall ports (80, 443, 22)

---

## 🐳 Docker Architecture

```
Frontend (React/Vite)
├─ Served by: Nginx
└─ Port: 80/443 (SSL)

Backend (Node.js/Express)
├─ Connected to: MySQL
├─ Using: Redis Cache
└─ Port: 3001 (internal)

Database (MySQL 8.0)
├─ Port: 3306 (internal)
└─ Volumes: Persistent storage

Cache (Redis 7)
├─ Port: 6379 (internal)
└─ Volumes: Persistent storage

Reverse Proxy (Nginx)
├─ Frontend: Routes to React
├─ API: Routes to Backend
├─ SSL: Let's Encrypt
└─ Ports: 80, 443 (public)
```

---

## 📊 Post-Deployment

### Verify Everything Works

```bash
# Check services
docker-compose ps

# View logs
docker-compose logs -f

# Test frontend
curl -k https://your-domain.com

# Test API
curl -k https://api.your-domain.com/api/health

# Run automated tests
./test-deployment.sh
```

### Maintenance Commands

```bash
# View logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Update application
cd /var/www/kaolack && git pull && docker-compose up -d --build

# Backup database
docker-compose exec mysql mysqldump -u kaolack_user -p kaolack_db > backup.sql

# SSH into container
docker-compose exec backend sh
```

---

## 🆘 Troubleshooting

### Service won't start
```bash
docker-compose logs backend  # See what's wrong
docker-compose restart backend
```

### Port already in use
```bash
lsof -i :3001  # Find process using port
kill -9 <PID>  # Kill the process
```

### Database error
```bash
docker-compose restart mysql
docker-compose exec mysql mysql -u root -p -e "SELECT 1;"
```

### SSL certificate issue
```bash
certbot renew --force-renewal
cp /etc/letsencrypt/live/mairiekaolack.sn/fullchain.pem /var/www/kaolack/ssl/cert.pem
docker-compose restart nginx
```

**More issues?** Check `DEPLOYMENT_VPS.md` Troubleshooting section.

---

## 🎯 Key Features

✅ **One-command deployment** with `deploy.sh`  
✅ **Automatic SSL** (Let's Encrypt)  
✅ **Docker containerized** (no dependency hell)  
✅ **Auto-backups** (daily)  
✅ **Health checks** (all services monitored)  
✅ **Rate limiting** (API protected)  
✅ **Security headers** (HSTS, CSP, etc.)  
✅ **Systemd integration** (auto-restart)  
✅ **Complete documentation** (50+ pages)  
✅ **Testing suite** (comprehensive)  

---

## 📋 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU Cores | 2 | 4+ |
| RAM | 4GB | 8GB+ |
| Storage | 50GB SSD | 100GB+ SSD |
| OS | Ubuntu 22.04 | Ubuntu 24.04 |
| Bandwidth | Unlimited | Unlimited |

---

## 🚀 Next Steps

### Immediate (After Deployment)
1. Test all functionality
2. Check SSL certificate
3. Verify backups working
4. Review logs for errors

### First Week
1. Configure monitoring
2. Setup email alerts
3. Enable 2FA
4. Review security

### First Month
1. Performance analysis
2. Backup testing
3. Disaster recovery test
4. Documentation review

---

## 💡 Advanced Configuration (Optional)

- Add CDN (CloudFlare)
- Setup monitoring (Prometheus/Grafana)
- Configure analytics
- Setup error tracking (Sentry)
- Performance optimization
- Scaling strategies

See `DEPLOYMENT_VPS.md` for detailed instructions.

---

## 📞 Support

### Documentation
- 📚 **Full Guide**: `STEP_BY_STEP_DEPLOYMENT.md`
- 🎯 **Quick Start**: `QUICKSTART_VPS.md`
- 🔧 **Troubleshooting**: `DEPLOYMENT_VPS.md`
- 📋 **Index**: `VPS_DEPLOYMENT_INDEX.md`

### Commands
```bash
# Run automated tests
./test-deployment.sh

# View real-time logs
docker-compose logs -f

# SSH into application
docker-compose exec backend sh
```

### Emergency
```bash
# Full restart
cd /var/www/kaolack
docker-compose down
docker-compose up -d

# View detailed logs
docker-compose logs --tail 100
```

---

## 📝 Version Information

- **Package Version**: 1.0
- **Created**: November 13, 2025
- **Status**: Production Ready ✅
- **Tested**: Ubuntu 22.04 LTS, 24.04 LTS
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

---

## 📄 License

Same as the main project: Kaolack Stories Connect

---

## 🎉 Ready?

### Start Here:

**Quick (10 min):**
```bash
cat QUICKSTART_VPS.md
```

**Detailed (30 min):**
```bash
cat STEP_BY_STEP_DEPLOYMENT.md
```

**Deploy:**
```bash
sudo ./deploy.sh
```

**Test:**
```bash
./test-deployment.sh
```

---

## 📞 Questions?

Check the documentation files above for:
- Pre-deployment checklist
- Step-by-step instructions
- Troubleshooting guide
- Security considerations
- Performance optimization

**Everything you need is included!** 🚀

---

**Happy Deploying!** 🎊

If you encounter any issues, refer to the troubleshooting sections in the comprehensive documentation.
