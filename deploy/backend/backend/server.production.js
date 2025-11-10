const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const db = require('./models');

// Import des routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin-simple');
const slidesRoutes = require('./routes/slides');
const newsRoutes = require('./routes/news');

const app = express();

// Configuration de sécurité pour la production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  }));
}

// Rate limiting plus strict en production
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 min en prod, 1 min en dev
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Trop de requêtes depuis cette IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Configuration CORS pour la production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN, 'https://mairie.quantum221.com', 'https://www.mairie.quantum221.com']
    : ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers uploadés avec cache en production
const uploadsPath = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/news', newsRoutes);

// Gestion d'erreur globale
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: err.message,
      stack: err.stack 
    });
  }
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route non trouvée' 
  });
});

const PORT = process.env.PORT || 3001;

// Démarrage du serveur avec gestion d'erreur
const startServer = async () => {
  try {
    console.log('🔗 Test de connexion à la base de données...');
    await testConnection();
    
    console.log('🔄 Synchronisation de la base de données...');
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS configuré pour: ${corsOptions.origin}`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🔒 Mode production activé - Sécurité renforcée');
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;