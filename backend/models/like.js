'use strict';

module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    post_id: {
      type: DataTypes.INTEGER,  
      allowNull: false
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
    tableName: 'likes',
    timestamps: false, // On gère manuellement les timestamps
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id'],
        name: 'unique_user_post_like'
      }
    ]
  });

  Like.associate = function(models) {
    // Un like appartient à un utilisateur
    Like.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    // Un like appartient à un post
    Like.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post'
    });
  };

  return Like;
};