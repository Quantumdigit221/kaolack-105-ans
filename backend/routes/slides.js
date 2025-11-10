const express = require('express');
const router = express.Router();
const { Slide } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/slides - Récupérer tous les slides
router.get('/', async (req, res) => {
  try {
    const slides = await Slide.findAll({
      order: [['order', 'ASC']],
      where: { is_active: true }
    });
    res.json(slides);
  } catch (error) {
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
      order: [['order', 'ASC']]
    });
    res.json(slides);
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
    const slide = await Slide.create(req.body);
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du slide' });
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