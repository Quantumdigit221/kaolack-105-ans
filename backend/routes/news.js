const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/news - Liste des actualités (public)
router.get('/', async (req, res) => {
  try {
    console.log('📰 [NEWS] Requête reçue:', req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      category,
      status = 'published',
      featured 
    } = req.query;

    console.log('📰 [NEWS] Paramètres:', { page, limit, category, status, featured });

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

    console.log('📰 [NEWS] Where clause:', whereClause);

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

    console.log('📰 [NEWS] Succès:', { count, newsCount: news.length });

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
    console.error('📰 [NEWS] Erreur détaillée:', error);
    console.error('📰 [NEWS] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des actualités',
      details: error.message 
    });
  }
});

// POST /api/news - Créer une nouvelle actualité
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('📰 [NEWS CREATE] Requête reçue:', req.body);
    
    const {
      title,
      content,
      excerpt,
      category,
      status = 'draft',
      priority = 0,
      featured = false,
      image_url,
      publication_date
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Le titre et le contenu sont obligatoires' 
      });
    }

    if (!category) {
      return res.status(400).json({ 
        error: 'La catégorie est obligatoire' 
      });
    }

    const userId = req.user.id;
    
    const news = await db.News.create({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim() : null,
      category,
      status,
      priority: parseInt(priority),
      featured: Boolean(featured),
      image_url: image_url || null,
      publication_date: publication_date ? new Date(publication_date) : null,
      author_id: userId
    });

    console.log('✅ [NEWS CREATE] Actualité créée:', news.id);

    // Récupérer l'actualité avec l'auteur
    const newsWithAuthor = await db.News.findByPk(news.id, {
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
    console.error('📰 [NEWS CREATE] Erreur:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de l\'actualité',
      details: error.message 
    });
  }
});

// GET /api/news/admin/all - Toutes les actualités pour l'admin
router.get('/admin/all', async (req, res) => {
  try {
    console.log('📰 [NEWS ADMIN] Requête reçue:', req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      category,
      status 
    } = req.query;

    console.log('📰 [NEWS ADMIN] Paramètres:', { page, limit, category, status });

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (status) {
      whereClause.status = status;
    }

    console.log('📰 [NEWS ADMIN] Where clause:', whereClause);

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

    console.log('📰 [NEWS ADMIN] Succès:', { count, newsCount: news.length });

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
    console.error('📰 [NEWS ADMIN] Erreur détaillée:', error);
    console.error('📰 [NEWS ADMIN] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des actualités',
      details: error.message 
    });
  }
});

module.exports = router;
