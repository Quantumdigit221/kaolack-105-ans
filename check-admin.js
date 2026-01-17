const db = require('./backend/models');
const { User } = db;

async function checkAdmin() {
  try {
    const admin = await User.findOne({ where: { email: 'admin@kaolackcommune.sn' } });
    if (admin) {
      console.log('Admin trouvé:', admin.toJSON());
    } else {
      console.log('Admin NON trouvé');
      const allAdmins = await User.findAll({ where: { role: 'admin' } });
      console.log('Tous les admins:', allAdmins.map(u => u.toJSON()));
    }
  } catch (err) {
    console.error('Erreur:', err.message);
  }
  process.exit(0);
}

checkAdmin();
