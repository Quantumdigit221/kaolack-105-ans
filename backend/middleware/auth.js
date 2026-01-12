const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer les informations de l'utilisateur avec Sequelize
    const user = await User.findOne({
      where: { 
        id: decoded.id || decoded.userId,
        is_active: true 
      },
      attributes: ['id', 'email', 'full_name', 'role', 'is_active']
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    // Utiliser les données fraîches de la base de données
    req.user = user.toJSON();
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// Middleware pour vérifier les rôles admin/moderator
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    next();
  };
};

// Middleware optionnel (ne bloque pas si pas de token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        where: { 
          id: decoded.id || decoded.userId,
          is_active: true 
        },
        attributes: ['id', 'email', 'full_name', 'role']
      });
      
      if (user) {
        req.user = user.toJSON();
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur
    console.log('Erreur optionalAuth:', error.message);
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
