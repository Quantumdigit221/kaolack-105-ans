const express = require('express');
const router = express.Router();
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

    let sql = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        CASE 
          WHEN l.user_id IS NOT NULL THEN 1 
          ELSE 0 
        END as is_liked
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ?
      WHERE p.is_published = 1
    `;
    
    const params = [req.user?.id || null];

    if (category) {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = await query(sql, params);

    // Compter le total pour la pagination
    let countSql = 'SELECT COUNT(*) as total FROM posts WHERE is_published = 1';
    const countParams = [];
    
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    const [{ total }] = await query(countSql, countParams);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/posts/:id - Récupérer un post spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        CASE 
          WHEN l.user_id IS NOT NULL THEN 1 
          ELSE 0 
        END as is_liked
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ?
      WHERE p.id = ? AND p.is_published = 1
    `;

    const posts = await query(sql, [req.user?.id || null, id]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    res.json(posts[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/posts - Créer un nouveau post
router.post('/', authenticateToken, validatePost, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { title, content, category, image_url } = req.body;
    const userId = req.user.id;

    const sql = `
      INSERT INTO posts (user_id, title, content, category, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await connection.execute(sql, [userId, title, content, category, image_url]);
    const postId = result[0].insertId;

    // Récupérer le post créé avec les informations de l'auteur
    const postSql = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        0 as is_liked
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;

    const [post] = await connection.execute(postSql, [postId]);

    await commit(connection);

    res.status(201).json({
      message: 'Post créé avec succès',
      post: post[0]
    });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({ error: 'Erreur lors de la création du post' });
  }
});

// PUT /api/posts/:id - Mettre à jour un post
router.put('/:id', authenticateToken, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;
    const { title, content, category, image_url } = req.body;
    const userId = req.user.id;

    // Vérifier que le post appartient à l'utilisateur ou que l'utilisateur est admin
    const checkSql = 'SELECT user_id FROM posts WHERE id = ?';
    const [posts] = await connection.execute(checkSql, [id]);

    if (posts.length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    if (posts[0].user_id !== userId && req.user.role !== 'admin') {
      await rollback(connection);
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const sql = `
      UPDATE posts 
      SET title = ?, content = ?, category = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await connection.execute(sql, [title, content, category, image_url, id]);

    await commit(connection);

    res.json({ message: 'Post mis à jour avec succès' });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la mise à jour du post:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du post' });
  }
});

// DELETE /api/posts/:id - Supprimer un post
router.delete('/:id', authenticateToken, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que le post appartient à l'utilisateur ou que l'utilisateur est admin
    const checkSql = 'SELECT user_id FROM posts WHERE id = ?';
    const [posts] = await connection.execute(checkSql, [id]);

    if (posts.length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    if (posts[0].user_id !== userId && req.user.role !== 'admin') {
      await rollback(connection);
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Supprimer le post (les commentaires et likes seront supprimés automatiquement par CASCADE)
    const sql = 'DELETE FROM posts WHERE id = ?';
    await connection.execute(sql, [id]);

    await commit(connection);

    res.json({ message: 'Post supprimé avec succès' });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du post' });
  }
});

// POST /api/posts/:id/like - Liker/Unliker un post
router.post('/:id/like', authenticateToken, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier si le post existe
    const postSql = 'SELECT id FROM posts WHERE id = ? AND is_published = 1';
    const [posts] = await connection.execute(postSql, [id]);

    if (posts.length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà liké ce post
    const likeSql = 'SELECT id FROM likes WHERE post_id = ? AND user_id = ?';
    const [likes] = await connection.execute(likeSql, [id, userId]);

    if (likes.length > 0) {
      // Unliker le post
      await connection.execute('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [id, userId]);
      await connection.execute('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [id]);
      
      await commit(connection);
      res.json({ message: 'Like supprimé', liked: false });
    } else {
      // Liker le post
      await connection.execute('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [id, userId]);
      await connection.execute('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [id]);
      
      await commit(connection);
      res.json({ message: 'Post liké', liked: true });
    }
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors du like:', error);
    res.status(500).json({ error: 'Erreur lors du like' });
  }
});

module.exports = router;
