const jwt = require('jsonwebtoken');
const db = require('../models');
const { User } = db;

// Middleware pour vérifier l'authentification admin
const requireAdmin = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        is_active: true 
      },
      attributes: ['id', 'email', 'full_name', 'role', 'is_active']
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est administrateur
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur middleware admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Middleware pour vérifier l'authentification utilisateur (non-admin)
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        is_active: true 
      },
      attributes: ['id', 'email', 'full_name', 'role', 'is_active']
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur middleware auth:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Middleware optionnel pour récupérer l'utilisateur si token présent
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        where: { 
          id: decoded.userId,
          is_active: true 
        },
        attributes: ['id', 'email', 'full_name', 'role', 'is_active']
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};

module.exports = {
  requireAdmin,
  requireAuth,
  optionalAuth
};