const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Personality = sequelize.define('Personality', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: {
          msg: "L'image doit être une URL valide"
        }
      }
    },
    contributions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    votes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved'),
      allowNull: false,
      defaultValue: 'pending'
    },
    proposedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Anonyme'
    }
  }, {
    tableName: 'personalities',
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['votes']
      },
      {
        fields: ['category']
      }
    ]
  });

  return Personality;
};
