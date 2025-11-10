const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
const PORT = process.env.PORT || 3001;

// Configuration CORS (doit être avant Helmet pour les uploads)
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origine (comme les apps mobiles)
    if (!origin) return callback(null, true);
    
    // Permettre localhost sur tous les ports
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Permettre les adresses IP locales sur tous les ports
    if (origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/)) {
      return callback(null, true);
    }
    
    // Permettre les adresses IP locales 10.x.x.x (autre plage réseau local)
    if (origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/)) {
      return callback(null, true);
    }
    
    // Permettre les adresses IP locales 172.16-31.x.x (autre plage réseau local)
    if (origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/)) {
      return callback(null, true);
    }
    
    // Liste des origines autorisées par défaut
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:8083',
      process.env.FRONTEND_URL || 'http://localhost:8081'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Non autorisé par CORS'));
  },
  credentials: true
}));

// Middleware de sécurité avec configuration pour les uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images uploadées) avec CORS approprié
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/news', newsRoutes);

// Routes de test (temporaire)
app.use('/api/test', require('./routes/test'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kaolack Stories Connect API',
    timestamp: new Date().toISOString()
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API Kaolack Stories Connect',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments',
      users: '/api/users',
      upload: '/api/upload'
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Démarrage du serveur
async function startServer() {
  try {
    // Test de connexion à la base de données
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    // Synchronisation des modèles Sequelize (en développement)
    // Utilisez 'force: true' pour tout recréer (supprime les données)
    await syncDatabase(false); // false = ne pas forcer la recréation des tables
    // Pour forcer la recréation, remplacez par: await syncDatabase(true);

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}`);
      console.log(`🌐 Frontend configuré pour: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
      console.log(`📁 Fichiers uploadés servis sur: http://localhost:${PORT}/uploads`);
      console.log(`🗄️  Base de données: ${process.env.DB_NAME || 'kaolack_stories_connect'}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des signaux d'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

startServer();
