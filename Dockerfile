# Dockerfile pour le backend
FROM node:18-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY backend/package*.json ./
RUN npm install --production

# Copier le code source
COPY backend/ ./

# Créer le dossier uploads
RUN mkdir -p uploads

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Démarrer l'application
CMD ["node", "server.js"]