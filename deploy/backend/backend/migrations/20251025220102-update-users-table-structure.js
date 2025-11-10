'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Supprimer la colonne username et remplacer first_name/last_name par full_name
    await queryInterface.removeColumn('users', 'username');
    await queryInterface.removeColumn('users', 'first_name');
    await queryInterface.removeColumn('users', 'last_name');
    
    // Ajouter la colonne full_name et city
    await queryInterface.addColumn('users', 'full_name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'Utilisateur'
    });
    
    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Renommer avatar en avatar_url pour correspondre à l'API
    await queryInterface.renameColumn('users', 'avatar', 'avatar_url');
  },

  async down (queryInterface, Sequelize) {
    // Restaurer l'ancienne structure
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    });
    
    await queryInterface.addColumn('users', 'first_name', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'last_name', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
    
    await queryInterface.removeColumn('users', 'full_name');
    await queryInterface.removeColumn('users', 'city');
    await queryInterface.renameColumn('users', 'avatar_url', 'avatar');
  }
};
