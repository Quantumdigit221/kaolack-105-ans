const express = require('express');
const router = express.Router();
const { Slide } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/slides - Récupérer tous les slides
router.get('/', async (req, res) => {
  try {
    const slides = await Slide.findAll({
      order: [['id', 'ASC']]
    });
    
    // Transformer les URLs des images pour le développement
    const transformedSlides = slides.map(slide => {
      const slideData = slide.toJSON();
      if (slideData.image) {
        // Remplacer l'ancien domaine par localhost:3001
        slideData.image = slideData.image.replace(
          /https:\/\/portail\.kaolackcommune\.sn\/uploads\//g,
          'http://127.0.0.1:3001/uploads/'
        );
      }
      return slideData;
    });
    
    res.json(transformedSlides);
  } catch (error) {
    console.error('❌ [SLIDES] Erreur lors de la récupération des slides:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des slides' });
  }
});

// GET /api/slides/admin - Récupérer tous les slides (admin)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    const slides = await Slide.findAll({
      order: [['id', 'ASC']]
    });
    
    // Transformer les URLs des images pour le développement
    const transformedSlides = slides.map(slide => {
      const slideData = slide.toJSON();
      if (slideData.image) {
        // Remplacer l'ancien domaine par localhost:3001
        slideData.image = slideData.image.replace(
          /https:\/\/portail\.kaolackcommune\.sn\/uploads\//g,
          'http://127.0.0.1:3001/uploads/'
        );
      }
      return slideData;
    });
    
    res.json(transformedSlides);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des slides' });
  }
});

// POST /api/slides - Créer un nouveau slide (admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    // Validation des champs requis
    if (!req.body.title || req.body.title.trim() === '') {
      return res.status(400).json({ error: 'Le titre est requis' });
    }
    
    // Log the request body (without the full image data if it's too large)
    const logData = { ...req.body };
    if (logData.image && logData.image.length > 100) {
      logData.image = logData.image.substring(0, 100) + '... (truncated, length: ' + logData.image.length + ')';
    }
    console.log('📝 [SLIDES] Création slide:', logData);
    
    // Préparer les données pour la création
    const slideData = {
      title: req.body.title.trim(),
      subtitle: req.body.subtitle ? req.body.subtitle.trim() : null,
      bg: req.body.bg ? req.body.bg.trim() : null,
      logo: req.body.logo !== undefined ? Boolean(req.body.logo) : true,
      image: req.body.image || null
    };
    
    // Si l'image est en base64 et très grande, limiter sa taille ou la convertir
    if (slideData.image && slideData.image.startsWith('data:image')) {
      const imageSize = slideData.image.length;
      console.log(`📸 [SLIDES] Taille de l'image base64: ${(imageSize / 1024 / 1024).toFixed(2)} MB`);
      
      // Limiter à 5MB de données base64 (environ 3.75MB d'image réelle)
      if (imageSize > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'L\'image est trop grande. Taille maximale: 5MB',
          imageSize: `${(imageSize / 1024 / 1024).toFixed(2)} MB`
        });
      }
    }
    
    const slide = await Slide.create(slideData);
    console.log('✅ [SLIDES] Slide créé avec succès, ID:', slide.id);
    res.status(201).json(slide);
  } catch (error) {
    console.error('❌ [SLIDES] Erreur lors de la création du slide:', error);
    console.error('❌ [SLIDES] Message:', error.message);
    console.error('❌ [SLIDES] Nom:', error.name);
    if (error.errors) {
      console.error('❌ [SLIDES] Erreurs de validation:', error.errors);
    }
    console.error('❌ [SLIDES] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erreur lors de la création du slide',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/slides/:id - Mettre à jour un slide (admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    const slide = await Slide.findByPk(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide non trouvé' });
    }
    await slide.update(req.body);
    res.json(slide);
  } catch (error) {
    console.error('❌ [SLIDES] Erreur lors de la mise à jour du slide:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du slide' });
  }
});

// DELETE /api/slides/:id - Supprimer un slide (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    const slide = await Slide.findByPk(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide non trouvé' });
    }
    await slide.destroy();
    res.json({ message: 'Slide supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du slide' });
  }
});

module.exports = router;