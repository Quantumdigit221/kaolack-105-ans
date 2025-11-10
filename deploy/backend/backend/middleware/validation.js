const Joi = require('joi');

// Schéma de validation pour un post
const postSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Le titre doit contenir au moins 3 caractères',
      'string.max': 'Le titre ne peut pas dépasser 255 caractères',
      'any.required': 'Le titre est requis'
    }),
  
  content: Joi.string()
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Le contenu doit contenir au moins 10 caractères',
      'string.max': 'Le contenu ne peut pas dépasser 5000 caractères',
      'any.required': 'Le contenu est requis'
    }),
  
  category: Joi.string()
    .valid('patrimoine', 'vie-quotidienne', 'evenements', 'personnalites')
    .required()
    .messages({
      'any.only': 'La catégorie doit être: patrimoine, vie-quotidienne, evenements, ou personnalites',
      'any.required': 'La catégorie est requise'
    }),
  
  image_url: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.uri': 'L\'URL de l\'image doit être valide'
    })
});

// Schéma de validation pour un commentaire
const commentSchema = Joi.object({
  post_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID du post doit être un nombre',
      'number.integer': 'L\'ID du post doit être un entier',
      'number.positive': 'L\'ID du post doit être positif',
      'any.required': 'L\'ID du post est requis'
    }),
  
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Le commentaire ne peut pas être vide',
      'string.max': 'Le commentaire ne peut pas dépasser 1000 caractères',
      'any.required': 'Le contenu du commentaire est requis'
    })
});

// Schéma de validation pour l'inscription
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'email doit être valide',
      'any.required': 'L\'email est requis'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères',
      'any.required': 'Le mot de passe est requis'
    }),
  
  full_name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom est requis'
    }),
  
  city: Joi.string()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'La ville ne peut pas dépasser 100 caractères'
    })
});

// Schéma de validation pour la connexion
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'L\'email doit être valide',
      'any.required': 'L\'email est requis'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Le mot de passe est requis'
    })
});

// Middleware de validation pour les posts
const validatePost = (req, res, next) => {
  const { error } = postSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Données invalides',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

// Middleware de validation pour les commentaires
const validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Données invalides',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

// Middleware de validation pour l'inscription
const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Données invalides',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

// Middleware de validation pour la connexion
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Données invalides',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

module.exports = {
  validatePost,
  validateComment,
  validateRegister,
  validateLogin,
  postSchema,
  commentSchema,
  registerSchema,
  loginSchema
};

