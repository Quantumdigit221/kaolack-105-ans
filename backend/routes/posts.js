const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/admin');
// PATCH /api/posts/:id/approve - Approuver un post (admin uniquement)
router.patch('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    post.status = 'published';
    await post.save();
    res.json({ message: 'Post approuvé avec succès', post });
  } catch (error) {
    console.error('Erreur lors de l\'approbation du post:', error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation du post' });
  }
});
// (supprimé doublon express et router)
const db = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validatePost } = require('../middleware/validation');

// GET /api/posts - Récupérer tous les posts avec pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const offset = (page - 1) * limit;

    // Construire les conditions de recherche
    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }

    // Récupérer les posts avec Sequelize
    const result = await db.Post.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'avatar_url']
      }],
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    // Transformer les URLs des images pour le développement
    const transformedPosts = result.rows.map(post => {
      const postData = post.toJSON();
      
      // Gérer les deux formats de champs: image_url et imageUrl
      ['image_url', 'imageUrl'].forEach(field => {
        if (postData[field]) {
          // Remplacer l'ancien domaine par localhost:3001 en HTTPS
          postData[field] = postData[field].replace(
            /https:\/\/portail\.kaolackcommune\.sn\/uploads\//g,
            'https://127.0.0.1:3001/uploads/'
          );
          // Corriger les URLs qui commencent par :3003/
          if (postData[field].startsWith(':3003/')) {
            postData[field] = postData[field].replace(':3003/', 'https://127.0.0.1:3001/');
          }
          // Corriger les URLs qui ont http://localhost:3003/
          if (postData[field].startsWith('http://localhost:3003/')) {
            postData[field] = postData[field].replace('http://localhost:3003/', 'https://127.0.0.1:3001/');
          }
          // Corriger les URLs HTTP en HTTPS pour localhost:3001
          if (postData[field].startsWith('http://127.0.0.1:3001/')) {
            postData[field] = postData[field].replace('http://127.0.0.1:3001/', 'https://127.0.0.1:3001/');
          }
        }
      });
      
      return postData;
    });

    const response = {
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total: result.count,
        pages: Math.ceil(result.count / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des posts',
      message: error.message 
    });
  }
});

// POST /api/posts - Créer un nouveau post
router.post('/', authenticateToken, validatePost, async (req, res) => {
  try {
    const { title, content, category, image_url } = req.body;
    const userId = req.user.id;
    
    // Créer le post avec Sequelize (status par défaut : 'pending')
    const newPost = await db.Post.create({
      userId: userId,
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl: image_url || null
    });

    // Récupérer le post créé avec les informations de l'auteur
    const postWithAuthor = await db.Post.findByPk(newPost.id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'avatar_url']
      }]
    });

    res.status(201).json({ 
      message: 'Histoire publiée avec succès !',
      post: {
        id: postWithAuthor.id,
        user_id: postWithAuthor.userId,
        title: postWithAuthor.title,
        content: postWithAuthor.content,
        category: postWithAuthor.category,
        image_url: postWithAuthor.imageUrl ? postWithAuthor.imageUrl.replace('http://127.0.0.1:3001/', 'https://127.0.0.1:3001/') : null,
        likes_count: postWithAuthor.likesCount,
        comments_count: postWithAuthor.commentsCount,
        created_at: postWithAuthor.createdAt,
        author_name: postWithAuthor.author.full_name,
        author_avatar: postWithAuthor.author.avatar_url,
        is_liked: false
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du post',
      message: error.message 
    });
  }
});

// GET /api/posts/:id - Récupérer un post spécifique
router.get('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Récupérer le post avec Sequelize
    const post = await db.Post.findByPk(postId, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'avatar_url']
      }]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Formater la réponse
    const formattedPost = {
      id: post.id,
      user_id: post.userId,
      title: post.title,
      content: post.content,
      category: post.category,
      image_url: post.imageUrl ? post.imageUrl.replace('http://127.0.0.1:3001/', 'https://127.0.0.1:3001/') : null,
      likes_count: post.likesCount,
      comments_count: post.commentsCount,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      author_name: post.author.full_name,
      author_avatar: post.author.avatar_url,
      is_liked: false // TODO: Vérifier si l'utilisateur connecté a liké ce post
    };

    res.json(formattedPost);
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du post',
      message: error.message 
    });
  }
});

// PUT /api/posts/:id - Modifier un post
router.put('/:id', authenticateToken, validatePost, async (req, res) => {
  try {
    const postId = req.params.id;
    
    res.status(501).json({ 
      error: 'Fonctionnalité non implémentée',
      message: 'Modification de posts à implémenter'
    });
  } catch (error) {
    console.error('Erreur lors de la modification du post:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la modification du post',
      message: error.message 
    });
  }
});

// DELETE /api/posts/:id - Supprimer un post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    
    res.status(501).json({ 
      error: 'Fonctionnalité non implémentée',
      message: 'Suppression de posts à implémenter'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression du post',
      message: error.message 
    });
  }
});

// POST /api/posts/:id/like - Liker/Unliker un post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    // Vérifier si le post existe
    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà liké ce post
    const existingLike = await db.sequelize.query(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      {
        replacements: [userId, postId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (existingLike.length > 0) {
      // Unlike - supprimer le like
      await db.sequelize.query(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        {
          replacements: [userId, postId],
          type: db.sequelize.QueryTypes.DELETE
        }
      );

      // Décrémenter le compteur de likes
      await post.decrement('likes_count');

      res.json({ 
        liked: false, 
        likes_count: post.likes_count - 1,
        message: 'Like retiré' 
      });
    } else {
      // Like - ajouter le like
      await db.sequelize.query(
        'INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, NOW())',
        {
          replacements: [userId, postId],
          type: db.sequelize.QueryTypes.INSERT
        }
      );

      // Incrémenter le compteur de likes
      await post.increment('likes_count');

      res.json({ 
        liked: true, 
        likes_count: post.likes_count + 1,
        message: 'Post liké' 
      });
    }
  } catch (error) {
    console.error('Erreur lors du like:', error);
    res.status(500).json({ 
      error: 'Erreur lors du like',
      message: error.message 
    });
  }
});

module.exports = router;