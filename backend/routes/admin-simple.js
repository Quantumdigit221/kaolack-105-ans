const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Middleware simple pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  
  // Vérifier le rôle dans la base de données OU dans le token (pour compatibilité)
  const userRole = req.user.role;
  const tokenRole = req.user.role; // Le rôle vient déjà de la base grâce au middleware
  
  if (userRole !== 'admin' && tokenRole !== 'admin') {
    console.log('Accès refusé. Rôle utilisateur:', userRole, 'Rôle token:', tokenRole);
    return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
  }
  
  next();
};

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/dashboard - Statistiques simples
router.get('/dashboard', async (req, res) => {
  try {
    // Compter les éléments de base
    const totalUsers = await db.User.count();
    const activeUsers = await db.User.count({ where: { is_active: true } });
    const totalPosts = await db.Post.count();
    const totalComments = await db.Comment ? await db.Comment.count() : 0;

    // Utilisateurs récents (7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await db.User.count({
      where: {
        created_at: {
          [db.sequelize.Sequelize.Op.gte]: sevenDaysAgo
        }
      }
    });

    const recentPosts = await db.Post.count({
      where: {
        created_at: {
          [db.sequelize.Sequelize.Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          recent: recentUsers
        },
        posts: {
          total: totalPosts,
          published: totalPosts, // Pour simplifier
          recent: recentPosts
        },
        comments: {
          total: totalComments,
          approved: totalComments // Pour simplifier
        }
      }
    });
  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/admin/users - Liste des utilisateurs
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await db.User.findAndCountAll({
      attributes: ['id', 'email', 'full_name', 'city', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// POST /api/admin/users - Créer un nouvel utilisateur
router.post('/users', async (req, res) => {
  try {
    const { email, password, full_name, city, role = 'user', is_active = true } = req.body;

    // Validation des champs obligatoires
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom complet sont obligatoires' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Validation du rôle
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' });
    }

    // Hasher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Créer le nouvel utilisateur avec Sequelize (identique à auth.js)
    const newUser = await db.User.create({
      email: email.toLowerCase().trim(),
      password_hash,
      full_name: full_name.trim(),
      city: city ? city.trim() : null,
      role,
      is_active: Boolean(is_active)
    });

    console.log(`✅ [ADMIN] Nouvel utilisateur créé: ${email} (${role}) par admin ID ${req.user.id}`);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        city: newUser.city,
        role: newUser.role,
        is_active: newUser.is_active
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    // Gestion des erreurs Sequelize spécifiques
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors.map(e => e.message)
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Cette adresse email est déjà utilisée'
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur lors de la création de l\'utilisateur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/posts - Liste des posts
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await db.Post.findAndCountAll({
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur liste posts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
  }
});

// PUT /api/admin/posts/:id/status - Modifier le statut d'un post (bloquer/débloquer)
router.put('/posts/:id/status', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { status } = req.body;

    // Valider le statut
    if (!['pending', 'published', 'blocked', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide. Valeurs autorisées: pending, published, blocked, archived' });
    }

    const post = await db.Post.findByPk(postId, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'email']
      }]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Mettre à jour le statut
    await post.update({ status });

    res.json({
      message: `Post ${status === 'blocked' ? 'bloqué' : status === 'published' ? 'approuvé' : status === 'pending' ? 'mis en attente' : 'archivé'} avec succès`,
      post: {
        id: post.id,
        title: post.title,
        status: post.status,
        author: post.author
      }
    });
  } catch (error) {
    console.error('Erreur modification statut post:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du statut' });
  }
});

// DELETE /api/admin/posts/:id - Supprimer un post
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await db.Post.findByPk(postId, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'email']
      }]
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Supprimer les données associées en premier (likes et commentaires)
    if (db.Like) {
      await db.Like.destroy({
        where: { post_id: postId }
      });
    }
    
    if (db.Comment) {
      await db.Comment.destroy({
        where: { post_id: postId }
      });
    }

    // Supprimer le post
    await post.destroy();

    console.log(`🗑️ [ADMIN] Post ID ${postId} (${post.title}) supprimé par admin ID ${req.user.id}`);
    
    res.json({ 
      message: 'Post supprimé avec succès',
      deletedPost: {
        id: post.id,
        title: post.title,
        author: post.author
      }
    });
  } catch (error) {
    console.error('Erreur suppression post:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du post' });
  }
});

// PUT /api/admin/users/:id/status - Modifier le statut d'un utilisateur
router.put('/users/:id/status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { is_active, role } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher un admin de se désactiver
    if (userId === req.user.id && is_active === false) {
      return res.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte' });
    }

    const updateData = {};
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (role && ['admin', 'moderator', 'user'].includes(role)) updateData.role = role;
    updateData.updated_at = db.sequelize.literal('CURRENT_TIMESTAMP');

    await user.update(updateData);

    res.json({
      message: 'Statut utilisateur mis à jour',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la modification' });
  }
});

// PUT /api/admin/users/:id/toggle-status - Basculer le statut actif/inactif d'un utilisateur
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher un admin de se désactiver lui-même
    if (userId === req.user.id && user.is_active) {
      return res.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte' });
    }

    // Basculer le statut
    await user.update({ 
      is_active: !user.is_active,
      updated_at: db.sequelize.literal('CURRENT_TIMESTAMP')
    });

    res.json({
      message: `Utilisateur ${!user.is_active ? 'activé' : 'désactivé'} avec succès`,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: !user.is_active
      }
    });
  } catch (error) {
    console.error('Erreur basculement statut utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors du basculement du statut' });
  }
});

// PUT /api/admin/users/:id - Modifier un utilisateur
router.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { email, password, full_name, city, role, is_active } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await db.User.findOne({
        where: { 
          email: email.toLowerCase().trim(),
          id: { [db.sequelize.Sequelize.Op.ne]: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' });
      }
    }

    // Validation du rôle
    if (role && !['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    const updateData = {};
    if (email) updateData.email = email.toLowerCase().trim();
    if (full_name) updateData.full_name = full_name.trim();
    if (city !== undefined) updateData.city = city ? city.trim() : null;
    if (role) updateData.role = role;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;

    if (password && password.trim()) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      updateData.password_hash = await bcrypt.hash(password.trim(), saltRounds);
    }

    updateData.updated_at = db.sequelize.literal('CURRENT_TIMESTAMP');
    await user.update(updateData);

    console.log(`📝 [ADMIN] Utilisateur ID ${userId} modifié par admin ID ${req.user.id}`);

    res.json({ 
      message: 'Utilisateur modifié avec succès',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        city: user.city,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' });
  }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Empêcher la suppression de son propre compte
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier s'il y a des contenus associés
    const postsCount = await db.Post.count({ where: { user_id: userId } });
    const commentsCount = await db.Comment ? await db.Comment.count({ where: { user_id: userId } }) : 0;

    if (postsCount > 0 || commentsCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer cet utilisateur : il a des contenus associés',
        suggestion: 'Vous pouvez le désactiver au lieu de le supprimer'
      });
    }

    await user.destroy();

    console.log(`🗑️ [ADMIN] Utilisateur ID ${userId} (${user.email}) supprimé par admin ID ${req.user.id}`);

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// GET /api/admin/analytics - Analyses simples
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Statistiques par catégorie
    const categoriesStats = await db.Post.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        category: {
          [db.sequelize.Op.not]: null
        }
      },
      group: ['category'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']]
    });

    res.json({
      userGrowth: [],
      postGrowth: [],
      categoriesStats: categoriesStats.map(cat => ({
        category: cat.category,
        count: parseInt(cat.getDataValue('count'))
      }))
    });
  } catch (error) {
    console.error('Erreur analytics:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des analyses' });
  }
});

// Route pour récupérer tous les posts pour l'admin
router.get('/posts', async (req, res) => {
  try {
    const posts = await db.Post.findAll({
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    console.error('Erreur récupération posts admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
  }
});

module.exports = router;