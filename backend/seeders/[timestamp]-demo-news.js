'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('News', [
      {
        titre: 'Lancement officiel des festivités du 105ème anniversaire',
        contenu: 'La municipalité de Kaolack lance officiellement les célébrations du 105ème anniversaire de la ville avec de nombreux événements prévus.',
        auteur_id: 1,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        titre: 'Nouveaux projets de développement économique',
        contenu: 'Plusieurs projets structurants sont en cours pour dynamiser l\'économie locale et créer des emplois.',
        auteur_id: 1,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('News', null, {});
  }
};
