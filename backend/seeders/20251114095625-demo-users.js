'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    return queryInterface.bulkInsert('users', [
      {
        email: 'admin@kaolackcommune.sn',
        password_hash: hashedPassword,
        full_name: 'Administrateur Kaolack',
        city: 'Kaolack',
        role: 'admin',
        is_active: true,
        is_admin: true,
        bio: 'Administrateur principal du portail des 105 ans de Kaolack',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'amadou.diop@example.com',
        password_hash: hashedPassword,
        full_name: 'Amadou Diop',
        city: 'Kaolack',
        role: 'user',
        is_active: true,
        is_admin: false,
        bio: 'Citoyen fier de Kaolack',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'fatou.fall@example.com',
        password_hash: hashedPassword,
        full_name: 'Fatou Fall',
        city: 'Kaolack',
        role: 'user',
        is_active: true,
        is_admin: false,
        bio: 'Résidente de Kaolack depuis toujours',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
