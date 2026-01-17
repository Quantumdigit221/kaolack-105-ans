const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const News = sequelize.define('News', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 200]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 5000]
      }
    },
    excerpt: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: 'Résumé court pour la page d\'accueil'
    },
    category: {
      type: DataTypes.ENUM,
      values: ['actualite', 'evenement', 'annonce', 'urgence', 'culture', 'economie', 'social'],
      defaultValue: 'actualite',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: ['draft', 'published', 'archived'],
      defaultValue: 'draft',
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Plus le chiffre est élevé, plus l\'actualité est prioritaire'
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Mettre en avant sur la page d\'accueil'
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
      // Validation supprimée pour permettre les URLs localhost
    },
    publication_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de publication programmée'
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'news',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['status', 'publication_date']
      },
      {
        fields: ['category', 'status']
      },
      {
        fields: ['featured', 'priority']
      }
    ]
  });

  News.associate = (models) => {
    News.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author'
    });
  };

  return News;
};