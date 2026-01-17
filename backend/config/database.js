const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuration de la base de données avec Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kaolack_stories',
  process.env.DB_USER || 'kaolack_user',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      idle: 30000,
      acquire: 60000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Test de connexion
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion Sequelize à MySQL réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Sequelize à MySQL:', error.message);
    return false;
  }
}

// Synchronisation des modèles (désactivée pour éviter les conflits de tablespace)
async function syncDatabase(force = false) {
  try {
    // Désactivé temporairement pour éviter les conflits de tablespace
    console.log('⚠️ Synchronisation Sequelize désactivée - tables déjà créées');
    return true;
  } catch (error) {
    console.error('❌ Erreur de synchronisation Sequelize:', error);
    return false;
  }
}

module.exports = {
  database: process.env.DB_NAME || 'kaolack_stories',
  username: process.env.DB_USER || 'kaolack_user',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    idle: 30000,
    acquire: 60000
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};
