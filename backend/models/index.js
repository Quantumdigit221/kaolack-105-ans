'use strict';


const { Sequelize } = require('sequelize');
const config = require('../config/database');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    logging: console.log, // Activer les logs pour debug
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

// Lire tous les modèles
fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .forEach(file => {
    try {
      const modelDefinition = require(path.join(__dirname, file));
      const modelName = file.replace('.js', '');
      const modelNameCapitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      
      // Vérifier si c'est une fonction (modèle Sequelize)
      if (typeof modelDefinition === 'function') {
        db[modelNameCapitalized] = modelDefinition(sequelize, Sequelize.DataTypes);
        console.log(`✅ Modèle chargé: ${modelNameCapitalized}`);
      } else {
        console.warn(`⚠️ Le fichier ${file} n'exporte pas une fonction de modèle`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du chargement du modèle ${file}:`, error.message);
    }
  });

// Associer les modèles
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`✅ Associations créées pour: ${modelName}`);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
