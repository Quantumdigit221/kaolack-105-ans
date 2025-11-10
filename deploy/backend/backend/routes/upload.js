const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, PNG, GIF, WebP) sont autorisées'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB par défaut
  },
  fileFilter: fileFilter
});

// POST /api/upload/image - Upload d'une image
router.post('/image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Construire l'URL de l'image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      message: 'Image uploadée avec succès',
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// POST /api/upload/avatar - Upload d'un avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Construire l'URL de l'avatar
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      message: 'Avatar uploadé avec succès',
      avatarUrl: avatarUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'avatar' });
  }
});

// DELETE /api/upload/:filename - Supprimer un fichier
router.delete('/:filename', authenticateToken, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Supprimer le fichier
    fs.unlinkSync(filePath);

    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
});

// Middleware de gestion d'erreurs pour multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fichier trop volumineux (max 5MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Trop de fichiers' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Champ de fichier inattendu' });
    }
  }
  
  if (error.message.includes('Seules les images')) {
    return res.status(400).json({ error: error.message });
  }

  console.error('Erreur multer:', error);
  res.status(500).json({ error: 'Erreur lors de l\'upload' });
});

module.exports = router;
