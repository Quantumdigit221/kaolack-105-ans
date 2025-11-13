# ========================================
# 📦 Backend Dockerfile
# ========================================

FROM node:20-alpine

WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache \
    curl \
    postgresql-client \
    mysql-client

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances Node
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p uploads logs

# Exposer le port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Démarrer l'application
CMD ["node", "server.js"]
