'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Modifier l'ENUM pour ajouter 'blocked'
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('draft', 'published', 'blocked', 'archived') DEFAULT 'published'"
    );
  },

  async down (queryInterface, Sequelize) {
    // Remettre l'ENUM original
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'published'"
    );
  }
};
