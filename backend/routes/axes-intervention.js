const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/axes-intervention');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Créer le dossier d'upload s'il n'existe pas
const ensureUploadDir = async () => {
  const uploadPath = path.join(__dirname, '../uploads/axes-intervention');
  try {
    await fs.access(uploadPath);
  } catch (error) {
    await fs.mkdir(uploadPath, { recursive: true });
  }
};

ensureUploadDir();

// Données initiales pour chaque axe
const initialData = {
  urbanisme: {
    titre: "Urbanisme & Infrastructure",
    description: "Construire la Kaolack de demain",
    contenu: "Nous œuvrons pour moderniser les infrastructures urbaines, améliorer la qualité de vie des citoyens et créer un environnement propice au développement économique durable.",
    projets: [
      {
        id: 1,
        titre: "Modernisation du Marché Central",
        description: "Rénovation complète du marché central de Kaolack avec des infrastructures modernes",
        statut: "en_cours",
        progression: 75,
        budget: "500M FCFA",
        delai: "18 mois",
        image: "",
        details: [
          "Construction de nouveaux bâtiments commerciaux",
          "Amélioration des systèmes d'assainissement",
          "Installation d'éclairage public LED",
          "Création de zones de stationnement"
        ],
        benefices: [
          "Plus de 500 commerçants bénéficieront des nouvelles infrastructures",
          "Amélioration des conditions d'hygiène et de sécurité",
          "Augmentation de la capacité d'accueil de 40%"
        ]
      }
    ],
    services: [
      {
        id: 1,
        titre: "Permis de Construire",
        description: "Délivrance des autorisations de construire",
        delai: "15 jours ouvrés",
        documents: ["Plan de masse", "Pièce d'identité", "Titre foncier"]
      }
    ],
    actualites: []
  },
  economie: {
    titre: "Développement Économique",
    description: "Stimuler la croissance et créer des opportunités",
    contenu: "Nous soutenons l'entrepreneuriat, attirons les investissements et créons un environnement favorable au développement économique durable pour tous les citoyens de Kaolack.",
    initiatives: [
      {
        id: 1,
        titre: "Programme d'Appui aux PME",
        description: "Accompagnement technique et financier pour les petites et moyennes entreprises",
        statut: "actif",
        progression: 80,
        budget: "300M FCFA",
        beneficiaires: "150 PME",
        secteur: "multi-secteurs",
        details: [
          "Formation en gestion d'entreprise",
          "Accès au financement bancaire",
          "Mise en relation avec des mentors",
          "Accompagnement à l'exportation"
        ],
        resultats: [
          "85% des PME accompagnées ont augmenté leur chiffre d'affaires",
          "Création de 500 emplois directs",
          "15 PME ont lancé des activités à l'export"
        ]
      }
    ],
    statistiques: [],
    secteurs: [],
    opportunites: []
  },
  culture: {
    titre: "Culture & Patrimoine",
    description: "Célébrer notre histoire et notre créativité",
    contenu: "Kaolack regorge d'un riche patrimoine culturel et historique. Découvrez nos sites emblématiques, nos événements culturels et les artistes qui font vivre notre culture.",
    sitesPatrimoniaux: [],
    evenements: [],
    artistes: []
  },
  services: {
    titre: "Services aux Citoyens",
    description: "Tous les services municipaux à votre portée",
    contenu: "Accédez facilement à l'ensemble des services municipaux : administratifs, sociaux, techniques et bien plus encore. Simplifions vos démarches au quotidien.",
    servicesAdministratifs: [],
    servicesSociaux: [],
    servicesTechniques: [],
    demarchesEnLigne: []
  }
};

// Route pour obtenir les données d'un axe spécifique
router.get('/:axe', async (req, res) => {
  try {
    const { axe } = req.params;
    
    if (!initialData[axe]) {
      return res.status(404).json({ message: 'Axe non trouvé' });
    }
    
    res.json(initialData[axe]);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour mettre à jour les données d'un axe
router.put('/:axe', async (req, res) => {
  try {
    const { axe } = req.params;
    const data = req.body;
    
    if (!initialData[axe]) {
      return res.status(404).json({ message: 'Axe non trouvé' });
    }
    
    // Mettre à jour les données
    initialData[axe] = { ...initialData[axe], ...data };
    
    res.json({ message: 'Données mises à jour avec succès', data: initialData[axe] });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour ajouter un projet/initiative/événement
router.post('/:axe/:type', upload.single('image'), async (req, res) => {
  try {
    const { axe, type } = req.params;
    const itemData = JSON.parse(req.body.data);
    
    if (!initialData[axe]) {
      return res.status(404).json({ message: 'Axe non trouvé' });
    }
    
    // Ajouter l'image si elle a été uploadée
    if (req.file) {
      itemData.image = `/uploads/axes-intervention/${req.file.filename}`;
    }
    
    // Ajouter un ID unique
    itemData.id = Date.now();
    
    // Ajouter à la section appropriée
    if (initialData[axe][type]) {
      initialData[axe][type].push(itemData);
    } else {
      initialData[axe][type] = [itemData];
    }
    
    res.status(201).json({ message: 'Élément ajouté avec succès', item: itemData });
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour mettre à jour un élément spécifique
router.put('/:axe/:type/:id', upload.single('image'), async (req, res) => {
  try {
    const { axe, type, id } = req.params;
    const itemData = JSON.parse(req.body.data);
    
    if (!initialData[axe]) {
      return res.status(404).json({ message: 'Axe non trouvé' });
    }
    
    const items = initialData[axe][type];
    if (!items) {
      return res.status(404).json({ message: 'Section non trouvée' });
    }
    
    const itemIndex = items.findIndex(item => item.id == id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Élément non trouvé' });
    }
    
    // Ajouter l'image si elle a été uploadée
    if (req.file) {
      itemData.image = `/uploads/axes-intervention/${req.file.filename}`;
    }
    
    // Mettre à jour l'élément
    items[itemIndex] = { ...items[itemIndex], ...itemData };
    
    res.json({ message: 'Élément mis à jour avec succès', item: items[itemIndex] });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour supprimer un élément
router.delete('/:axe/:type/:id', async (req, res) => {
  try {
    const { axe, type, id } = req.params;
    
    if (!initialData[axe]) {
      return res.status(404).json({ message: 'Axe non trouvé' });
    }
    
    const items = initialData[axe][type];
    if (!items) {
      return res.status(404).json({ message: 'Section non trouvée' });
    }
    
    const itemIndex = items.findIndex(item => item.id == id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Élément non trouvé' });
    }
    
    // Supprimer l'image si elle existe
    const item = items[itemIndex];
    if (item.image) {
      try {
        const imagePath = path.join(__dirname, '..', item.image);
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
      }
    }
    
    // Supprimer l'élément
    items.splice(itemIndex, 1);
    
    res.json({ message: 'Élément supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir tous les axes (pour l'admin)
router.get('/', async (req, res) => {
  try {
    res.json(initialData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
