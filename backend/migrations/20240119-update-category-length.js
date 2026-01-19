'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Modifier la colonne category pour augmenter sa taille de 50 à 100 caractères
      await queryInterface.changeColumn('posts', 'category', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      
      console.log('✅ Colonne category mise à jour avec succès (50 → 100 caractères)');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la colonne category:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revenir à la taille originale (rollback)
      await queryInterface.changeColumn('posts', 'category', {
        type: Sequelize.STRING(50),
        allowNull: true
      });
      
      console.log('✅ Rollback de la colonne category effectué (100 → 50 caractères)');
    } catch (error) {
      console.error('❌ Erreur lors du rollback de la colonne category:', error);
      throw error;
    }
  }
};
