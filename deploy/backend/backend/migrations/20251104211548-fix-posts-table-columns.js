'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Renommer featured_image en image_url
    await queryInterface.renameColumn('posts', 'featured_image', 'image_url');
    
    // Ajouter la colonne is_featured manquante
    await queryInterface.addColumn('posts', 'is_featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Supprimer la colonne is_featured
    await queryInterface.removeColumn('posts', 'is_featured');
    
    // Renommer image_url en featured_image
    await queryInterface.renameColumn('posts', 'image_url', 'featured_image');
  }
};
