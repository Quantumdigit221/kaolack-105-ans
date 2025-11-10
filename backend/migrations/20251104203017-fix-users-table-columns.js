'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Renommer la colonne password en password_hash
    await queryInterface.renameColumn('users', 'password', 'password_hash');
    
    // Ajouter la colonne role manquante
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'moderator', 'user'),
      defaultValue: 'user',
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Supprimer la colonne role
    await queryInterface.removeColumn('users', 'role');
    
    // Renommer password_hash en password
    await queryInterface.renameColumn('users', 'password_hash', 'password');
  }
};
