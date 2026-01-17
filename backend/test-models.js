const db = require('./models');

async function testModels() {
  try {
    console.log('🔍 Test des modèles...');
    
    // Tester la connexion
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');
    
    // Lister les modèles chargés
    console.log('📋 Modèles chargés:', Object.keys(db));
    
    // Tester le modèle News
    if (db.News) {
      console.log('✅ Modèle News trouvé');
      
      // Compter les actualités
      const newsCount = await db.News.count();
      console.log(`📰 Nombre d'actualités: ${newsCount}`);
      
      // Récupérer quelques actualités
      const news = await db.News.findAll({
        limit: 3,
        order: [['created_at', 'DESC']]
      });
      console.log('📰 Dernières actualités:', news.map(n => ({ id: n.id, title: n.title })));
      
    } else {
      console.log('❌ Modèle News non trouvé');
    }
    
    // Tester le modèle User
    if (db.User) {
      console.log('✅ Modèle User trouvé');
      
      // Compter les utilisateurs
      const userCount = await db.User.count();
      console.log(`👤 Nombre d'utilisateurs: ${userCount}`);
      
    } else {
      console.log('❌ Modèle User non trouvé');
    }
    
    console.log('🎉 Test terminé avec succès');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

testModels();
