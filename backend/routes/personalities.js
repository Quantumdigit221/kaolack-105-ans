const express = require('express');
const router = express.Router();
const { Personality } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/personalities - Récupérer toutes les personnalités approuvées
router.get('/', async (req, res) => {
  try {
    const personalities = await Personality.findAll({
      where: { status: 'approved' },
      order: [['votes', 'DESC'], ['id', 'ASC']]
    });
    
    res.json({
      success: true,
      data: personalities,
      total: personalities.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des personnalités:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des personnalités"
    });
  }
});

// GET /api/personalities/admin - Récupérer toutes les personnalités (admin)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const personalities = await Personality.findAll({
      order: [['id', 'DESC']]
    });
    
    res.json({
      success: true,
      data: personalities,
      total: personalities.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des personnalités admin:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des personnalités"
    });
  }
});

// POST /api/personalities - Créer une nouvelle personnalité
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      role,
      description,
      image,
      contributions,
      status = 'pending',
      proposedBy = 'Admin'
    } = req.body;

    // Validation
    if (!name || !category || !role || !description || !image) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis"
      });
    }

    const personality = await Personality.create({
      name,
      category,
      role,
      description,
      image,
      contributions: contributions ? (Array.isArray(contributions) ? contributions : contributions.split('\n').filter(c => c.trim())) : [],
      votes: 0,
      status,
      proposedBy
    });

    res.status(201).json({
      success: true,
      data: personality,
      message: "Personnalité créée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la création de la personnalité:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la personnalité"
    });
  }
});

// PUT /api/personalities/:id - Mettre à jour une personnalité
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const personality = await Personality.findByPk(id);

    if (!personality) {
      return res.status(404).json({
        success: false,
        error: "Personnalité non trouvée"
      });
    }

    const {
      name,
      category,
      role,
      description,
      image,
      contributions,
      status
    } = req.body;

    await personality.update({
      name: name || personality.name,
      category: category || personality.category,
      role: role || personality.role,
      description: description || personality.description,
      image: image || personality.image,
      contributions: contributions ? (Array.isArray(contributions) ? contributions : contributions.split('\n').filter(c => c.trim())) : personality.contributions,
      status: status || personality.status
    });

    res.json({
      success: true,
      data: personality,
      message: "Personnalité mise à jour avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la personnalité:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la personnalité"
    });
  }
});

// DELETE /api/personalities/:id - Supprimer une personnalité
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const personality = await Personality.findByPk(id);

    if (!personality) {
      return res.status(404).json({
        success: false,
        error: "Personnalité non trouvée"
      });
    }

    await personality.destroy();

    res.json({
      success: true,
      message: "Personnalité supprimée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la personnalité:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de la personnalité"
    });
  }
});

// POST /api/personalities/:id/vote - Voter pour une personnalité
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const personality = await Personality.findByPk(id);

    if (!personality) {
      return res.status(404).json({
        success: false,
        error: "Personnalité non trouvée"
      });
    }

    if (personality.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: "Seules les personnalités approuvées peuvent recevoir des votes"
      });
    }

    await personality.increment('votes');

    res.json({
      success: true,
      data: { votes: personality.votes + 1 },
      message: "Vote enregistré avec succès"
    });
  } catch (error) {
    console.error('Erreur lors du vote:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors du vote"
    });
  }
});

module.exports = router;
