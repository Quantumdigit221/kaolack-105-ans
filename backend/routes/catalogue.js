const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload des PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/catalogue');
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'catalogue-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
  }
});

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
};

// GET /api/catalogue - Liste publique des catalogues
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search,
      status = 'published'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = { status: 'published' };

    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.like]: `%${search}%` } },
        { personality: { [db.Sequelize.Op.like]: `%${search}%` } },
        { description: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: catalogues } = await db.Catalogue.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }],
      order: [
        ['featured', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(limit),
      offset
    });

    res.json({
      catalogues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération catalogues:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catalogues' });
  }
});

// GET /api/catalogue/:id - Détail d'un catalogue
router.get('/:id', async (req, res) => {
  try {
    const catalogue = await db.Catalogue.findByPk(req.params.id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }]
    });

    if (!catalogue) {
      return res.status(404).json({ error: 'Catalogue non trouvé' });
    }

    if (catalogue.status !== 'published') {
      return res.status(404).json({ error: 'Catalogue non trouvé' });
    }

    // Incrémenter le compteur de vues
    await catalogue.increment('views_count');

    res.json(catalogue);
  } catch (error) {
    console.error('Erreur récupération catalogue:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du catalogue' });
  }
});

// === ROUTES ADMIN (authentification requise) ===
router.use(requireAdmin);

// POST /api/catalogue/admin - Créer un nouveau catalogue
router.post('/admin', upload.single('pdf'), async (req, res) => {
  try {
    const {
      title,
      personality,
      description,
      status = 'draft',
      featured = false
    } = req.body;

    // Validation
    if (!title || !personality || !description) {
      return res.status(400).json({ error: 'Titre, personnalité et description sont requis' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Le fichier PDF est requis' });
    }

    // Construire l'URL du PDF
    const pdfUrl = `/uploads/catalogue/${req.file.filename}`;

    const catalogue = await db.Catalogue.create({
      title,
      personality,
      description,
      pdf_url: pdfUrl,
      status,
      featured: featured === 'true' || featured === true,
      author_id: req.user.id
    });

    const catalogueWithAuthor = await db.Catalogue.findByPk(catalogue.id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }]
    });

    res.status(201).json({
      message: 'Catalogue créé avec succès',
      catalogue: catalogueWithAuthor
    });
  } catch (error) {
    console.error('Erreur création catalogue:', error);
    res.status(500).json({ error: 'Erreur lors de la création du catalogue' });
  }
});

// PUT /api/catalogue/admin/:id - Modifier un catalogue
router.put('/admin/:id', upload.single('pdf'), async (req, res) => {
  try {
    const catalogue = await db.Catalogue.findByPk(req.params.id);
    
    if (!catalogue) {
      return res.status(404).json({ error: 'Catalogue non trouvé' });
    }

    const {
      title,
      personality,
      description,
      status,
      featured
    } = req.body;

    // Préparer les données de mise à jour
    const updateData = {
      title: title || catalogue.title,
      personality: personality || catalogue.personality,
      description: description || catalogue.description,
      status: status !== undefined ? status : catalogue.status,
      featured: featured !== undefined ? (featured === 'true' || featured === true) : catalogue.featured
    };

    // Si un nouveau PDF est uploadé
    if (req.file) {
      // Supprimer l'ancien fichier
      if (catalogue.pdf_url && catalogue.pdf_url.startsWith('/uploads/catalogue/')) {
        const oldFilePath = path.join(__dirname, '..', catalogue.pdf_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Ajouter la nouvelle URL
      updateData.pdf_url = `/uploads/catalogue/${req.file.filename}`;
    }

    await catalogue.update(updateData);

    const updatedCatalogue = await db.Catalogue.findByPk(catalogue.id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['id', 'full_name']
      }]
    });

    res.json({
      message: 'Catalogue mis à jour avec succès',
      catalogue: updatedCatalogue
    });
  } catch (error) {
    console.error('Erreur mise à jour catalogue:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du catalogue' });
  }
});

// DELETE /api/catalogue/admin/:id - Supprimer un catalogue
router.delete('/admin/:id', async (req, res) => {
  try {
    const catalogue = await db.Catalogue.findByPk(req.params.id);
    
    if (!catalogue) {
      return res.status(404).json({ error: 'Catalogue non trouvé' });
    }

    // Supprimer le fichier PDF
    if (catalogue.pdf_url && catalogue.pdf_url.startsWith('/uploads/catalogue/')) {
      const filePath = path.join(__dirname, '..', catalogue.pdf_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await catalogue.destroy();

    res.json({ message: 'Catalogue supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression catalogue:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du catalogue' });
  }
});

// GET /api/catalogue/admin/all - Tous les catalogues pour l'admin
router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.like]: `%${search}%` } },
        { personality: { [db.Sequelize.Op.like]: `%${search}%` } },
        { description: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: catalogues } = await db.Catalogue.findAndCountAll({
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
      catalogues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur admin catalogues:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catalogues' });
  }
});

module.exports = router;
