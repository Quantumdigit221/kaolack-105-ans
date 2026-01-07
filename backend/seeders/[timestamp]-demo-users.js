'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        nom: 'Administrateur',
        prenom: 'Kaolack',
        email: 'admin@kaolackcommune.sn',
        telephone: '+221771234567',
        password: '$2b$10$9XQXvXx6bNXz3LQE1qEyLO7YVm8fJ9KkNYpWYzXz1pqRkNzYxYzXz', // password123
        role: 'admin',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Diop',
        prenom: 'Amadou',
        email: 'amadou.diop@example.com',
        telephone: '+221771234568',
        password: '$2b$10$9XQXvXx6bNXz3LQE1qEyLO7YVm8fJ9KkNYpWYzXz1pqRkNzYxYzXz', // password123
        role: 'user',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Fall',
        prenom: 'Fatou',
        email: 'fatou.fall@example.com',
        telephone: '+221771234569',
        password: '$2b$10$9XQXvXx6bNXz3LQE1qEyLO7YVm8fJ9KkNYpWYzXz1pqRkNzYxYzXz', // password123
        role: 'user',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
