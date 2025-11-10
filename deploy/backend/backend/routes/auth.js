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
      first_name, 
      last_name, 
      bio, 
      full_name, 
      city, 
      address 
    } = req.body;

    // Adaptation pour accepter full_name du frontend et les nouveaux champs
    const finalUsername = username || email.split('@')[0];
    const finalFirstName = first_name || (full_name ? full_name.split(' ')[0] : null);
    const finalLastName = last_name || (full_name ? full_name.split(' ').slice(1).join(' ') : null);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password_hash: passwordHash,
      username: finalUsername,
      first_name: finalFirstName,
      last_name: finalLastName,
      full_name: full_name || `${finalFirstName} ${finalLastName}`.trim(),
      city: city || null,
      address: address || null,
      bio: bio || null,
      role: 'user',
      is_active: true
    });

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
        full_name: user.full_name,
        city: user.city,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
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

    // Récupérer l'utilisateur
    const user = await User.findOne({
      where: { 
        email: email,
        is_active: true 
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    await user.update({ last_login_at: new Date() });

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
        avatar_url: user.avatar_url,
        city: user.city,
        role: user.role,
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
      attributes: ['id', 'email', 'full_name', 'avatar_url', 'city', 'role', 'created_at', 'last_login_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      city: user.city,
      role: user.role,
      created_at: user.created_at,
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
    const { username, firstName, lastName, bio, avatar } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        isActive: true 
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

    // Mettre à jour les champs fournis
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    await user.update(updateData);

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        isAdmin: user.isAdmin
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
        isActive: true 
      },
      attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'isAdmin']
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
        isActive: true 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await user.update({ password: newPasswordHash });

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
