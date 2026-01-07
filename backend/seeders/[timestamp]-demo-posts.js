'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Posts', [
      {
        titre: 'Bienvenue sur le portail des 105 ans de Kaolack',
        contenu: 'Nous célébrons cette année le 105ème anniversaire de notre belle ville de Kaolack. Partagez vos souvenirs et votre fierté !',
        auteur_id: 1,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        titre: 'Histoire de Kaolack : Les grandes figures',
        contenu: 'Découvrez les personnalités qui ont marqué l\'histoire de Kaolack depuis 1920...',
        auteur_id: 1,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        titre: 'Mon témoignage sur Kaolack',
        contenu: 'Je suis fier d\'être originaire de Kaolack. Cette ville a une histoire riche et un potentiel économique énorme.',
        auteur_id: 2,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Posts', null, {});
  }
};
