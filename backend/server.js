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
const botRoutes = require('./routes/bot');
const catalogueRoutes = require('./routes/catalogue');

const app = express();
app.set('trust proxy', 1); // Important pour les proxies inverses
const PORT = process.env.PORT || 3001;

// Configuration CORS
const allowedDomains = [
  'http://portail.kaolackcommune.sn',
  'https://portail.kaolackcommune.sn',
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);  // Supprime les valeurs nulles

const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme les apps mobiles ou curl)
    if (!origin) return callback(null, true);
    
    // En développement, autoriser localhost
    if (process.env.NODE_ENV !== 'production') {
      if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
        return callback(null, true);
      }
    }
    
    // Vérifier si l'origine est dans la liste des domaines autorisés
    if (allowedDomains.some(domain => 
      origin === domain || 
      origin.startsWith(domain + '/')
    )) {
      return callback(null, true);
    }
    
    console.log('Requête bloquée par CORS:', origin);
    callback(new Error('Non autorisé par CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count']
};

app.use(cors(corsOptions));

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean),
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limite chaque IP à 1000 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration des en-têtes pour les fichiers statiques
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Middleware pour le logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/catalogue', catalogueRoutes);

// Routes de test (temporaire)
app.use('/api/test', require('./routes/test'));
app.use('/api/bot', botRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kaolack Stories Connect API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API Kaolack Stories Connect',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments',
      users: '/api/users',
      upload: '/api/upload',
      health: '/api/health'
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });

  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas sur ce serveur.`,
    availableEndpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      health: '/api/health'
    }
  });
});

// Fonction pour vérifier et mettre à jour la structure de la base de données
async function checkDatabaseStructure() {
  try {
    // Vérifiez si la colonne username existe
    const [results] = await db.sequelize.query("SHOW COLUMNS FROM users LIKE 'username'");
    if (results.length === 0) {
      console.log('ℹ️ La colonne username n\'existe pas, création...');
      await db.sequelize.query("ALTER TABLE users ADD COLUMN username VARCHAR(255) NULL AFTER email");
    }

    // Vérifier si la table slides existe
    const [tables] = await db.sequelize.query("SHOW TABLES LIKE 'slides'");
    if (tables.length === 0) {
      console.log('ℹ️ La table slides n\'existe pas, création...');
      await db.sequelize.query(`
        CREATE TABLE slides (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255) NULL,
          bg VARCHAR(255) NULL,
          logo BOOLEAN NOT NULL DEFAULT TRUE,
          image LONGTEXT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('✅ Table slides créée avec succès');
    } else {
      console.log('✅ Table slides existe déjà');
    }

    // Ajoutez d'autres vérifications de colonnes si nécessaire
    // Exemple pour vérifier d'autres colonnes :
    /*
    const [emailResults] = await db.sequelize.query("SHOW COLUMNS FROM users LIKE 'email'");
    if (emailResults.length === 0) {
      console.log('ℹ️ La colonne email n\'existe pas, création...');
      await db.sequelize.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE");
    }
    */
  } catch (error) {
    console.error('Erreur lors de la vérification de la structure de la base de données:', error);
    // Ne pas bloquer le démarrage pour les erreurs de vérification
    return false;
  }
  return true;
}

// Démarrage du serveur
async function startServer() {
  try {
    console.log('🔌 Test de connexion à la base de données...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    console.log('🔄 Vérification de la structure de la base de données...');
    await checkDatabaseStructure();

    console.log('🔄 Synchronisation de la base de données...');
    await syncDatabase(process.env.NODE_ENV === 'development');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Serveur démarré avec succès !`);
      console.log(`----------------------------------------`);
      console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🌍 Frontend: ${process.env.FRONTEND_URL || 'Non configuré'}`);
      console.log(`🗄️  Base de données: ${process.env.DB_NAME || 'Non configurée'}`);
      console.log(`🔑 Mode: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Développement'}`);
      console.log(`----------------------------------------\n`);
    });
  } catch (error) {
    console.error('❌ Erreur critique lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des signaux d'arrêt
const shutdown = (signal) => {
  console.log(`\n${signal} reçu, arrêt du serveur...`);
  // Fermeture propre des connexions
  if (db.sequelize) {
    db.sequelize.close();
  }
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Démarrer le serveur
startServer();