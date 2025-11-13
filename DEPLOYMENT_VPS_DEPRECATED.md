# VPS Deployment - Deprecated

This project previously included an automated VPS deployment script (`deploy.sh`) and full Docker orchestration for Ubuntu VPS.

Important: per project direction, VPS Docker deployment has been deprecated and removed from the repository to avoid accidental usage. The target deployment is now the cPanel-hosted subdomain `http://portail.kaolackcommune.sn/`.

If you still require the old VPS artifacts (Docker files, scripts), they can be restored from Git history. Contact the repository owner or inspect previous commits.

Recommended new workflow:
- Frontend: build with `npm run build` and upload `dist/` to the cPanel document root for `portail.kaolackcommune.sn`.
- Backend: host the Node API using your cPanel Node.js app (if supported) or on an external Node host (Render, DigitalOcean App Platform, etc.).
- Database: create a MySQL database in cPanel and configure credentials in `backend/.env.production` or via the cPanel environment manager.

See `DEPLOYMENT_CPANEL.md` and `QUICKSTART_CPANEL.md` for detailed instructions.
