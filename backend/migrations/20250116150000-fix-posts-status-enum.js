'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Fixer l'ENUM pour inclure 'pending' qui est manquant
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('pending', 'draft', 'published', 'blocked', 'archived') DEFAULT 'pending'"
    );
  },

  async down (queryInterface, Sequelize) {
    // Revenir à l'ENUM sans 'pending'
    await queryInterface.sequelize.query(
      "ALTER TABLE posts MODIFY COLUMN status ENUM('draft', 'published', 'blocked', 'archived') DEFAULT 'published'"
    );
  }
};
