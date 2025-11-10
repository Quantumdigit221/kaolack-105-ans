'use strict';

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'image_url'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },

    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'likes_count'
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'comments_count'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'blocked', 'archived'),
      allowNull: false,
      defaultValue: 'published'
    }

  }, {
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['category']
      }
    ]
  });

  Post.associate = function(models) {
    // Un post appartient à un utilisateur
    Post.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'author'
    });
    
    // Un post peut avoir plusieurs commentaires
    Post.hasMany(models.Comment, {
      foreignKey: 'post_id',
      as: 'comments'
    });
    
    // Un post peut avoir plusieurs likes
    Post.hasMany(models.Like, {
      foreignKey: 'post_id',
      as: 'likes'
    });
  };

  return Post;
};