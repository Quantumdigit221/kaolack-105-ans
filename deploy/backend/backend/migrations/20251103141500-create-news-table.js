'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('news', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      excerpt: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('actualite', 'evenement', 'annonce', 'urgence', 'culture', 'economie', 'social'),
        defaultValue: 'actualite',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      publication_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Ajout des index
    await queryInterface.addIndex('news', ['status', 'publication_date']);
    await queryInterface.addIndex('news', ['category', 'status']);
    await queryInterface.addIndex('news', ['featured', 'priority']);
    await queryInterface.addIndex('news', ['author_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('news');
  }
};