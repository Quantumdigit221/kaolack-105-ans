const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
};

// GET /api/news - Liste des actualités (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      status = 'published',
      featured 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {
      status: status
    };

    if (category) {
      whereClause.category = category;
    }

    if (featured === 'true') {
      whereClause.featured = true;
    }

    // Pour les actualités publiques, ne montrer que les publiées et avec date <= maintenant
    if (status === 'published') {
      whereClause.publication_date = {
        [db.Sequelize.Op.or]: [
          null,
          { [db.Sequelize.Op.lte]: new Date() }
        ]
      };
    }

    const { count, rows: news } = await db.News.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }],
      order: [
        ['priority', 'DESC'],
        ['publication_date', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(limit),
      offset
    });

    res.json({
      news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération actualités:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des actualités' });
  }
});

// GET /api/news/featured - Actualités mises en avant pour la page d'accueil
router.get('/featured', async (req, res) => {
  try {
    const news = await db.News.findAll({
      where: {
        status: 'published',
        featured: true,
        publication_date: {
          [db.Sequelize.Op.or]: [
            null,
            { [db.Sequelize.Op.lte]: new Date() }
          ]
        }
      },
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }],
      order: [
        ['priority', 'DESC'],
        ['publication_date', 'DESC']
      ],
      limit: 5
    });

    res.json({ news });
  } catch (error) {
    console.error('Erreur actualités featured:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des actualités' });
  }
});

// GET /api/news/:id - Détail d'une actualité
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await db.News.findByPk(req.params.id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }]
    });

    if (!newsItem) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }

    // Incrémenter le compteur de vues
    await newsItem.increment('views_count');

    res.json(newsItem);
  } catch (error) {
    console.error('Erreur récupération actualité:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'actualité' });
  }
});

// === ROUTES ADMIN (authentification requise) ===
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/news/admin/all - Toutes les actualités pour l'admin
router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    const { count, rows: news } = await db.News.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur admin actualités:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des actualités' });
  }
});

// POST /api/news/admin - Créer une nouvelle actualité
router.post('/admin', async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category = 'actualite',
      status = 'draft',
      priority = 0,
      featured = false,
      image_url,
      publication_date
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Titre et contenu requis' });
    }

    const newsItem = await db.News.create({
      title,
      content,
      excerpt,
      category,
      status,
      priority: parseInt(priority),
      featured,
      image_url,
      publication_date: publication_date ? new Date(publication_date) : null,
      author_id: req.user.id
    });

    const newsWithAuthor = await db.News.findByPk(newsItem.id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }]
    });

    res.status(201).json({
      message: 'Actualité créée avec succès',
      news: newsWithAuthor
    });
  } catch (error) {
    console.error('Erreur création actualité:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Erreur lors de la création de l\'actualité' });
  }
});

// PUT /api/news/admin/:id - Modifier une actualité
router.put('/admin/:id', async (req, res) => {
  try {
    const newsItem = await db.News.findByPk(req.params.id);
    
    if (!newsItem) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }

    const {
      title,
      content,
      excerpt,
      category,
      status,
      priority,
      featured,
      image_url,
      publication_date
    } = req.body;

    await newsItem.update({
      title: title || newsItem.title,
      content: content || newsItem.content,
      excerpt: excerpt !== undefined ? excerpt : newsItem.excerpt,
      category: category || newsItem.category,
      status: status || newsItem.status,
      priority: priority !== undefined ? parseInt(priority) : newsItem.priority,
      featured: featured !== undefined ? featured : newsItem.featured,
      image_url: image_url !== undefined ? image_url : newsItem.image_url,
      publication_date: publication_date !== undefined ? 
        (publication_date ? new Date(publication_date) : null) : newsItem.publication_date
    });

    const updatedNews = await db.News.findByPk(newsItem.id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }]
    });

    res.json({
      message: 'Actualité mise à jour avec succès',
      news: updatedNews
    });
  } catch (error) {
    console.error('Erreur mise à jour actualité:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'actualité' });
  }
});

// DELETE /api/news/admin/:id - Supprimer une actualité
router.delete('/admin/:id', async (req, res) => {
  try {
    const newsItem = await db.News.findByPk(req.params.id);
    
    if (!newsItem) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }

    await newsItem.destroy();

    res.json({ message: 'Actualité supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression actualité:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'actualité' });
  }
});

// GET /api/news/admin/stats - Statistiques des actualités
router.get('/admin/stats', async (req, res) => {
  try {
    const totalNews = await db.News.count();
    const publishedNews = await db.News.count({ where: { status: 'published' } });
    const draftNews = await db.News.count({ where: { status: 'draft' } });
    const featuredNews = await db.News.count({ where: { featured: true } });

    // Statistiques par catégorie
    const categoriesStats = await db.News.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']]
    });

    res.json({
      total: totalNews,
      published: publishedNews,
      draft: draftNews,
      featured: featuredNews,
      categories: categoriesStats.map(cat => ({
        category: cat.category,
        count: parseInt(cat.getDataValue('count'))
      }))
    });
  } catch (error) {
    console.error('Erreur stats actualités:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router;