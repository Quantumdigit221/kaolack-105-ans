const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../models');
const { User } = db;

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
  try {

    const { 
      email, 
      password, 
      username, 
      bio, 
      full_name, 
      city,
      role = 'user'
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'email existe déjà avec une requête SQL directe
    const [existingUsers] = await db.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: [email.toLowerCase().trim()]
      }
    );

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Générer un username unique si non fourni (mais on ne l'utilisera pas car username n'existe plus)
    let finalUsername = username || email.split('@')[0];

    // Hasher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Valider le rôle
    const validRoles = ['user', 'moderator', 'admin'];
    const finalRole = validRoles.includes(role) ? role : 'user';

    // Créer l'utilisateur avec une requête SQL directe pour éviter les problèmes de colonnes
    // (first_name, last_name, username ont été supprimés dans les migrations)
    const insertSql = `
      INSERT INTO users (email, password_hash, full_name, city, bio, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const [results, metadata] = await db.sequelize.query(insertSql, {
      replacements: [
        email.toLowerCase().trim(),
        passwordHash,
        full_name || finalUsername,
        city ? city.trim() : null,
        bio || null,
        finalRole,
        true
      ]
    });

    const newUserId = metadata?.insertId || results?.insertId || results;

    if (!newUserId) {
      throw new Error('Impossible de récupérer l\'ID de l\'utilisateur créé');
    }

    // Récupérer l'utilisateur créé avec une requête SQL directe pour éviter les problèmes de colonnes
    const [userRows] = await db.sequelize.query(
      'SELECT id, email, full_name, city, bio, role, is_active, created_at FROM users WHERE id = ?',
      {
        replacements: [newUserId]
      }
    );

    if (!userRows || userRows.length === 0) {
      throw new Error('Utilisateur créé mais impossible de le récupérer');
    }

    const user = userRows[0];

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_EXPIRY || '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: null, // username n'existe plus dans la base de données
        full_name: user.full_name,
        city: user.city,
        bio: user.bio,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    console.error('Détails de l\'erreur:', error.message);
    console.error('Nom de l\'erreur:', error.name);
    if (error.errors) {
      console.error('Erreurs de validation:', error.errors);
    }
    console.error('Stack:', error.stack);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors.map(e => e.message) 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Cet email est déjà utilisé'
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur lors de l\'inscription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      name: process.env.NODE_ENV === 'development' ? error.name : undefined
    });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Récupérer l'utilisateur avec une requête SQL directe pour éviter les problèmes de colonnes
    const [userRows] = await db.sequelize.query(
      'SELECT id, email, password_hash, full_name, city, role, is_active, created_at, updated_at FROM users WHERE email = ? AND is_active = 1',
      {
        replacements: [email.toLowerCase().trim()]
      }
    );

    if (!userRows || userRows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = userRows[0];

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_EXPIRY || '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        city: user.city || null,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// POST /api/auth/logout - Déconnexion
router.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

// GET /api/auth/me - Récupérer les informations de l'utilisateur connecté
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      where: { 
        id: decoded.id || decoded.userId,
        is_active: true 
      },
      attributes: ['id', 'email', 'username', 'full_name', 'city', 'bio', 'avatar_url', 'role', 'is_active', 'created_at', 'last_login_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      city: user.city,
      bio: user.bio,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
      posts_count: 0, // Temporaire
      comments_count: 0 // Temporaire
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/auth/profile - Mettre à jour le profil utilisateur
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, full_name, bio, city, avatar_url } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        is_active: true 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si le nouveau username n'est pas déjà pris
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: { username: username }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }

    // Mettre à jour les champs fournis (uniquement ceux existants)
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (bio !== undefined) updateData.bio = bio;
    if (city !== undefined) updateData.city = city;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    await user.update(updateData);

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        bio: user.bio,
        city: user.city,
        avatar_url: user.avatar_url,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login_at: user.last_login_at
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors.map(e => e.message) 
      });
    }
    
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/refresh - Rafraîchir le token
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        is_active: true 
      },
      attributes: ['id', 'email', 'username', 'full_name', 'bio', 'city', 'avatar_url', 'role', 'is_active', 'created_at', 'last_login_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Générer un nouveau token
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_EXPIRY || '24h' }
    );

    res.json({
      message: 'Token rafraîchi',
      token: newToken,
      user: user
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur lors du rafraîchissement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/change-password - Changer le mot de passe
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Récupérer l'utilisateur
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        is_active: true 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await user.update({ password_hash: newPasswordHash });

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
