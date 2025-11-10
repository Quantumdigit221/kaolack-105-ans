'use strict';

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
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
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'post_id',
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'approved'
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'likes_count'
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['post_id']
      },
      {
        fields: ['parent_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  Comment.associate = function(models) {
    // Un commentaire appartient à un utilisateur
    Comment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'author'
    });
    
    // Un commentaire appartient à un post
    Comment.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post'
    });
    
    // Un commentaire peut avoir un parent (commentaire de commentaire)
    Comment.belongsTo(models.Comment, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
    
    // Un commentaire peut avoir plusieurs réponses
    Comment.hasMany(models.Comment, {
      foreignKey: 'parent_id',
      as: 'replies'
    });
  };

  return Comment;
};