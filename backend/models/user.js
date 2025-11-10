'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'moderator', 'user'),
      defaultValue: 'user'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: 'users',
    timestamps: false, // On gère manuellement les timestamps
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });

  User.associate = function(models) {
    // Un utilisateur peut avoir plusieurs posts
    User.hasMany(models.Post, {
      foreignKey: 'user_id',
      as: 'posts'
    });
    
    // Un utilisateur peut avoir plusieurs commentaires
    User.hasMany(models.Comment, {
      foreignKey: 'user_id',
      as: 'comments'
    });
    
    // Un utilisateur peut avoir plusieurs likes
    User.hasMany(models.Like, {
      foreignKey: 'user_id',
      as: 'likes'
    });
  };

  return User;
};