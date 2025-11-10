const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../models');

// GET /api/comments/:postId - Récupérer les commentaires d'un post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Utiliser Sequelize pour récupérer les commentaires
    const { count, rows: comments } = await db.Comment.findAndCountAll({
      where: { 
        postId: postId,      // Utiliser postId au lieu de post_id
        status: 'approved' // Assumant que 'approved' est l'équivalent de is_active = 1
      },
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'avatar_url']
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author_name: comment.author?.full_name || 'Utilisateur anonyme',
        author_avatar: comment.author?.avatar_url || null
      })),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/comments - Créer un nouveau commentaire
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { post_id, content } = req.body;
    const userId = req.user.id;

    // Validation
    if (!post_id || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post ID et contenu requis' });
    }

    // Vérifier que le post existe
    const post = await db.Post.findOne({
      where: { 
        id: post_id,
        status: 'published' // Supposant que 'published' est l'équivalent de is_published = 1
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Créer le commentaire avec Sequelize - utiliser les noms de propriétés du modèle
    const comment = await db.Comment.create({
      postId: post_id,        // Utiliser postId au lieu de post_id
      userId: userId,         // Utiliser userId au lieu de user_id
      content: content.trim(),
      status: 'approved' // Auto-approuver le commentaire
    });

    // Mettre à jour le compteur de commentaires
    await db.Post.increment('commentsCount', {
      where: { id: post_id }
    });

    // Récupérer le commentaire créé avec les informations de l'auteur
    const newComment = await db.Comment.findOne({
      where: { id: comment.id },
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name', 'avatar_url']
      }]
    });

    res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      comment: {
        id: newComment.id,
        content: newComment.content,
        created_at: newComment.created_at,
        updated_at: newComment.updated_at,
        author_name: newComment.author?.full_name || 'Utilisateur anonyme',
        author_avatar: newComment.author?.avatar_url || null
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
});

// PUT /api/comments/:id - Mettre à jour un commentaire
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Contenu requis' });
    }

    // Vérifier que le commentaire existe et appartient à l'utilisateur
    const comment = await db.Comment.findOne({
      where: { 
        id: id,
        status: 'approved' // Équivalent de is_active = 1
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    if (comment.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Mettre à jour le commentaire avec Sequelize
    await comment.update({
      content: content.trim()
    });

    res.json({ message: 'Commentaire mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du commentaire' });
  }
});

// DELETE /api/comments/:id - Supprimer un commentaire
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que le commentaire existe et appartient à l'utilisateur
    const comment = await db.Comment.findOne({
      where: { 
        id: id,
        status: 'approved' // Équivalent de is_active = 1
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    if (comment.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Marquer le commentaire comme supprimé (soft delete)
    await comment.update({
      status: 'rejected' // Utiliser rejected comme équivalent de is_active = 0
    });

    // Mettre à jour le compteur de commentaires dans le post
    await db.Post.decrement('commentsCount', {
      where: { id: comment.postId }
    });

    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
  }
});

module.exports = router;
