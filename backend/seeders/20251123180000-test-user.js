'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'testuser@example.com' }, {});
  },
  down: async (queryInterface, Sequelize) => {
    // rien à faire
    return Promise.resolve();
  }
};
