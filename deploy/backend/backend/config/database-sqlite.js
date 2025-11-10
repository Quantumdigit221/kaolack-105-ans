const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration temporaire avec SQLite pour éviter les problèmes MySQL
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Test de connexion
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion Sequelize à SQLite réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Sequelize à SQLite:', error.message);
    return false;
  }
}

// Synchronisation des modèles
async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('✅ Synchronisation des modèles Sequelize réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de synchronisation Sequelize:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};