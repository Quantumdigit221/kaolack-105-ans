// Configuration production pour le VPS
module.exports = {
  port: process.env.PORT || 3001,
  host: '0.0.0.0',
  
  // Base de données
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'kaolack_stories',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    dialect: 'mysql',
    
    // Options de connexion
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    // Logging en production (moins verbeux)
    logging: false,
    
    // Timeouts
    acquire: 60000,
    timeout: 15000,
    
    // Options de dialecte
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'kaolack-105-ans-secret-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    destination: process.env.UPLOAD_PATH || '/var/www/kaolack/uploads'
  },
  
  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'https://portail.kaolackcommune.sn',
    credentials: true
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par windowMs
    message: {
      error: 'Trop de requêtes, veuillez réessayer plus tard'
    }
  },
  
  // Sécurité
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      }
    }
  }
};
