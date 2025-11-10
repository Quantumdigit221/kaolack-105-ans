const express = require('express');
const router = express.Router();
const db = require('../models');
const { User, Post, Comment } = db;
const { requireAdmin } = require('../middleware/admin');

// Appliquer le middleware admin à toutes les routes
router.use(requireAdmin);

// GET /api/admin/dashboard - Tableau de bord avec statistiques
router.get('/dashboard', async (req, res) => {
  try {
    // Statistiques générales
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalPosts = await Post.count();
    const publishedPosts = await Post.count({ where: { status: 'published' } });
    const totalComments = await Comment.count();
    const approvedComments = await Comment.count({ where: { status: 'approved' } });

    // Utilisateurs récents (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: sevenDaysAgo
        }
      }
    });

    // Posts récents (7 derniers jours)
    const recentPosts = await Post.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: sevenDaysAgo
        }
      }
    });

    // Top auteurs (par nombre de posts)
    const topAuthors = await User.findAll({
      attributes: [
        'id',
        'username', 
        'firstName',
        'lastName',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('posts.id')), 'postCount']
      ],
      include: [{
        model: Post,
        as: 'posts',
        attributes: []
      }],
      group: ['User.id'],
      order: [[db.Sequelize.fn('COUNT', db.Sequelize.col('posts.id')), 'DESC']],
      limit: 5
    });

    // Posts populaires (par nombre de vues)
    const popularPosts = await Post.findAll({
      attributes: ['id', 'title', 'viewsCount', 'likesCount', 'commentsCount'],
      include: [{
        model: User,
        as: 'author',
        attributes: ['username', 'firstName', 'lastName']
      }],
      order: [['viewsCount', 'DESC']],
      limit: 5
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
          published: publishedPosts,
          recent: recentPosts
        },
        comments: {
          total: totalComments,
          approved: approvedComments
        }
      },
      topAuthors,
      popularPosts
    });
  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/admin/users - Liste des utilisateurs avec pagination et filtres
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status; // 'active', 'inactive', 'admin'

    // Construction des conditions de recherche
    const whereConditions = {};
    
    if (search) {
      whereConditions[db.Sequelize.Op.or] = [
        { username: { [db.Sequelize.Op.like]: `%${search}%` } },
        { email: { [db.Sequelize.Op.like]: `%${search}%` } },
        { firstName: { [db.Sequelize.Op.like]: `%${search}%` } },
        { lastName: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    if (status === 'active') {
      whereConditions.isActive = true;
      whereConditions.isAdmin = false;
    } else if (status === 'inactive') {
      whereConditions.isActive = false;
    } else if (status === 'admin') {
      whereConditions.isAdmin = true;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: [
        'id', 'username', 'email', 'firstName', 'lastName', 
        'avatar', 'bio', 'isActive', 'isAdmin', 'lastLoginAt', 'createdAt'
      ],
      include: [{
        model: Post,
        as: 'posts',
        attributes: [[db.Sequelize.fn('COUNT', db.Sequelize.col('posts.id')), 'count']]
      }],
      group: ['User.id'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      subQuery: false
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
    console.error('Erreur liste utilisateurs admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// PUT /api/admin/users/:id/status - Modifier le statut d'un utilisateur
router.put('/users/:id/status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive, isAdmin } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher un admin de se désactiver lui-même
    if (userId === req.user.id && isActive === false) {
      return res.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte' });
    }

    // Mettre à jour le statut
    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin;

    await user.update(updateData);

    res.json({
      message: 'Statut utilisateur mis à jour',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Erreur modification statut utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du statut' });
  }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher un admin de se supprimer lui-même
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Supprimer l'utilisateur (cela supprimera aussi ses posts et commentaires via les contraintes)
    await user.destroy();

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// GET /api/admin/posts - Gestion des posts avec pagination et filtres
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status; // 'draft', 'published', 'archived'
    const category = req.query.category;

    // Construction des conditions de recherche
    const whereConditions = {};
    
    if (search) {
      whereConditions[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.like]: `%${search}%` } },
        { content: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereConditions.status = status;
    }

    if (category) {
      whereConditions.category = category;
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
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
    console.error('Erreur liste posts admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
  }
});

// PUT /api/admin/posts/:id/status - Modifier le statut d'un post
router.put('/posts/:id/status', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const post = await Post.findByPk(postId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username', 'firstName', 'lastName']
      }]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    await post.update({ status });

    res.json({
      message: 'Statut du post mis à jour',
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

    const post = await Post.findByPk(postId);
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

// GET /api/admin/comments - Gestion des commentaires
router.get('/comments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // 'pending', 'approved', 'rejected'

    const whereConditions = {};
    if (status) {
      whereConditions.status = status;
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur liste commentaires admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
});

// PUT /api/admin/comments/:id/status - Modérer un commentaire
router.put('/comments/:id/status', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['title']
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    await comment.update({ status });

    res.json({
      message: 'Statut du commentaire mis à jour',
      comment: {
        id: comment.id,
        content: comment.content.substring(0, 100) + '...',
        status: comment.status,
        author: comment.author,
        post: comment.post
      }
    });
  } catch (error) {
    console.error('Erreur modération commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la modération' });
  }
});

// DELETE /api/admin/comments/:id - Supprimer un commentaire
router.delete('/comments/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    await comment.destroy();
    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
  }
});

// GET /api/admin/analytics - Analyses et statistiques avancées
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // 7, 30, 90 jours
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Évolution des utilisateurs
    const userGrowth = await User.findAll({
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'],
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: daysAgo
        }
      },
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('created_at'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'ASC']]
    });

    // Évolution des posts
    const postGrowth = await Post.findAll({
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'],
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: daysAgo
        }
      },
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('created_at'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'ASC']]
    });

    // Catégories populaires
    const categoriesStats = await Post.findAll({
      attributes: [
        'category',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: {
        category: {
          [db.Sequelize.Op.not]: null
        }
      },
      group: ['category'],
      order: [[db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      userGrowth,
      postGrowth,
      categoriesStats
    });
  } catch (error) {
    console.error('Erreur analytics admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des analyses' });
  }
});

module.exports = router;