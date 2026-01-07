'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Les IDs utilisateurs créés par le seeder users sont 1, 2, 3
    return queryInterface.bulkInsert('posts', [
      {
        title: 'Bienvenue sur le portail des 105 ans de Kaolack',
        content: 'Nous célébrons cette année le 105ème anniversaire de notre belle ville de Kaolack. Partagez vos souvenirs et votre fierté !',
        user_id: 11,
        status: 'published',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Histoire de Kaolack : Les grandes figures',
        content: 'Découvrez les personnalités qui ont marqué l\'histoire de Kaolack depuis 1920. Notre ville a vu naître de grands hommes et femmes...',
        user_id: 12,
        status: 'published',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Mon témoignage sur Kaolack',
        content: 'Je suis fier d\'être originaire de Kaolack. Cette ville a une histoire riche et un potentiel économique énorme.',
        user_id: 13,
        status: 'published',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('posts', null, {});
  }
};
