const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Middleware simple pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  
  if (req.user.role !== 'admin') {
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
      attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at'],
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
    if (!['published', 'blocked', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide. Valeurs autorisées: published, blocked, archived' });
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
      message: `Post ${status === 'blocked' ? 'bloqué' : status === 'published' ? 'publié' : 'archivé'} avec succès`,
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

    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    await post.destroy();
    res.json({ message: 'Post supprimé avec succès' });
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