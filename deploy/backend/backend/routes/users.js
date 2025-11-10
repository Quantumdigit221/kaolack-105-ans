const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { query, beginTransaction, commit, rollback } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/users/profile - Récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        id, email, username, full_name, first_name, last_name, avatar_url, city, address, role, is_active, created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = ? AND is_published = 1) as posts_count,
        (SELECT COUNT(*) FROM comments WHERE user_id = ? AND is_active = 1) as comments_count
      FROM users 
      WHERE id = ? AND is_active = 1
    `;

    const users = await query(sql, [userId, userId, userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/profile - Mettre à jour le profil
router.put('/profile', authenticateToken, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const userId = req.user.id;
    const { full_name, username, first_name, last_name, city, address, avatar_url } = req.body;

    // Validation
    if (!full_name || full_name.trim().length === 0) {
      await rollback(connection);
      return res.status(400).json({ error: 'Le nom complet est requis' });
    }

    // Vérifier l'unicité du nom d'utilisateur s'il est fourni
    if (username && username.trim()) {
      const checkUsername = await connection.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username.trim(), userId]
      );
      
      if (checkUsername[0].length > 0) {
        await rollback(connection);
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }

    const sql = `
      UPDATE users 
      SET full_name = ?, username = ?, first_name = ?, last_name = ?, city = ?, address = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await connection.execute(sql, [
      full_name.trim(), 
      username ? username.trim() : null, 
      first_name ? first_name.trim() : null, 
      last_name ? last_name.trim() : null, 
      city ? city.trim() : null, 
      address ? address.trim() : null, 
      avatar_url || null, 
      userId
    ]);

    await commit(connection);

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// PUT /api/users/password - Changer le mot de passe
router.put('/password', authenticateToken, async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Validation
    if (!current_password || !new_password) {
      await rollback(connection);
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (new_password.length < 6) {
      await rollback(connection);
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Récupérer le mot de passe actuel
    const userSql = 'SELECT password_hash FROM users WHERE id = ?';
    const users = await connection.execute(userSql, [userId]);

    if (users[0].length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(current_password, users[0][0].password_hash);

    if (!isValidPassword) {
      await rollback(connection);
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Mettre à jour le mot de passe
    await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    await commit(connection);

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

// GET /api/users/:id/posts - Récupérer les posts d'un utilisateur
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        CASE 
          WHEN l.user_id IS NOT NULL THEN 1 
          ELSE 0 
        END as is_liked
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ?
      WHERE p.user_id = ? AND p.is_published = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const posts = await query(sql, [req.user?.id || null, id, limit, offset]);

    // Compter le total
    const countSql = 'SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND is_published = 1';
    const [{ total }] = await query(countSql, [id]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des posts utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/users - Récupérer tous les utilisateurs (admin seulement)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        id, email, full_name, avatar_url, city, role, created_at, is_active,
        (SELECT COUNT(*) FROM posts WHERE user_id = users.id AND is_published = 1) as posts_count,
        (SELECT COUNT(*) FROM comments WHERE user_id = users.id AND is_active = 1) as comments_count
      FROM users 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = await query(sql, [limit, offset]);

    // Compter le total
    const countSql = 'SELECT COUNT(*) as total FROM users';
    const [{ total }] = await query(countSql);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id/role - Changer le rôle d'un utilisateur (admin seulement)
router.put('/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validation
    if (!role || !['admin', 'moderator', 'user'].includes(role)) {
      await rollback(connection);
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Vérifier que l'utilisateur existe
    const userSql = 'SELECT id FROM users WHERE id = ?';
    const users = await connection.execute(userSql, [id]);

    if (users[0].length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le rôle
    await connection.execute(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [role, id]
    );

    await commit(connection);

    res.json({ message: 'Rôle mis à jour avec succès' });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
});

// PUT /api/users/:id/status - Activer/Désactiver un utilisateur (admin seulement)
router.put('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Validation
    if (typeof is_active !== 'boolean') {
      await rollback(connection);
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Vérifier que l'utilisateur existe
    const userSql = 'SELECT id FROM users WHERE id = ?';
    const users = await connection.execute(userSql, [id]);

    if (users[0].length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le statut
    await connection.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_active, id]
    );

    await commit(connection);

    res.json({ 
      message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès` 
    });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// PUT /api/users/:id/toggle-status - Basculer le statut d'un utilisateur (admin seulement)
router.put('/:id/toggle-status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;

    // Empêcher la modification de son propre statut
    if (parseInt(id) === req.user.id) {
      await rollback(connection);
      return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre statut' });
    }

    // Récupérer le statut actuel
    const userSql = 'SELECT id, is_active FROM users WHERE id = ?';
    const users = await connection.execute(userSql, [id]);

    if (users[0].length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const currentStatus = users[0][0].is_active;
    const newStatus = !currentStatus;

    // Mettre à jour le statut
    await connection.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );

    await commit(connection);

    res.json({ 
      message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`,
      user: { id: parseInt(id), is_active: newStatus }
    });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur lors du changement de statut' });
  }
});

// POST /api/users - Créer un nouvel utilisateur (admin seulement)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { email, password, full_name, city, role = 'user', is_active = true } = req.body;

    // Validation des champs obligatoires
    if (!email || !password || !full_name) {
      await rollback(connection);
      return res.status(400).json({ error: 'Email, mot de passe et nom complet sont obligatoires' });
    }

    if (password.length < 6) {
      await rollback(connection);
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Validation du rôle
    if (!['user', 'moderator', 'admin'].includes(role)) {
      await rollback(connection);
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Vérifier si l'email existe déjà
    const existingUserSql = 'SELECT id FROM users WHERE email = ?';
    const existingUsers = await connection.execute(existingUserSql, [email.toLowerCase().trim()]);

    if (existingUsers[0].length > 0) {
      await rollback(connection);
      return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' });
    }

    // Hasher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insérer le nouvel utilisateur
    const insertSql = `
      INSERT INTO users (email, password_hash, full_name, city, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const result = await connection.execute(insertSql, [
      email.toLowerCase().trim(),
      password_hash,
      full_name.trim(),
      city ? city.trim() : null,
      role,
      Boolean(is_active)
    ]);

    await commit(connection);

    const newUserId = result[0].insertId;

    console.log(`✅ [ADMIN] Nouvel utilisateur créé: ${email} (${role}) par admin ID ${req.user.id}`);

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUserId,
        email: email.toLowerCase().trim(),
        full_name: full_name.trim(),
        city: city ? city.trim() : null,
        role,
        is_active: Boolean(is_active)
      }
    });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// PUT /api/users/:id - Modifier un utilisateur (admin seulement)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;
    const { email, password, full_name, city, role, is_active } = req.body;

    // Vérifier que l'utilisateur existe
    const userSql = 'SELECT email FROM users WHERE id = ?';
    const users = await connection.execute(userSql, [id]);

    if (users[0].length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const currentUser = users[0][0];

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== currentUser.email) {
      const existingUserSql = 'SELECT id FROM users WHERE email = ? AND id != ?';
      const existingUsers = await connection.execute(existingUserSql, [email.toLowerCase().trim(), id]);

      if (existingUsers[0].length > 0) {
        await rollback(connection);
        return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' });
      }
    }

    // Validation du rôle
    if (role && !['user', 'moderator', 'admin'].includes(role)) {
      await rollback(connection);
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Construire la requête de mise à jour
    let updateSql = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const updateParams = [];

    if (email) {
      updateSql += ', email = ?';
      updateParams.push(email.toLowerCase().trim());
    }

    if (full_name) {
      updateSql += ', full_name = ?';
      updateParams.push(full_name.trim());
    }

    if (city !== undefined) {
      updateSql += ', city = ?';
      updateParams.push(city ? city.trim() : null);
    }

    if (role) {
      updateSql += ', role = ?';
      updateParams.push(role);
    }

    if (is_active !== undefined) {
      updateSql += ', is_active = ?';
      updateParams.push(Boolean(is_active));
    }

    if (password && password.trim()) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password.trim(), saltRounds);
      updateSql += ', password_hash = ?';
      updateParams.push(password_hash);
    }

    updateSql += ' WHERE id = ?';
    updateParams.push(id);

    await connection.execute(updateSql, updateParams);

    await commit(connection);

    console.log(`📝 [ADMIN] Utilisateur ID ${id} modifié par admin ID ${req.user.id}`);

    res.json({ message: 'Utilisateur modifié avec succès' });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur (admin seulement)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;

    // Empêcher la suppression de son propre compte
    if (parseInt(id) === req.user.id) {
      await rollback(connection);
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Vérifier que l'utilisateur existe
    const userSql = 'SELECT email FROM users WHERE id = ?';
    const users = await connection.execute(userSql, [id]);

    if (users[0].length === 0) {
      await rollback(connection);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userEmail = users[0][0].email;

    // Vérifier s'il y a des contenus associés
    const contentCheckSql = `
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = ?) as posts_count,
        (SELECT COUNT(*) FROM comments WHERE user_id = ?) as comments_count
    `;
    const contentCheck = await connection.execute(contentCheckSql, [id, id]);
    const { posts_count, comments_count } = contentCheck[0][0];

    if (posts_count > 0 || comments_count > 0) {
      await rollback(connection);
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet utilisateur : il a des contenus associés',
        suggestion: 'Vous pouvez le désactiver au lieu de le supprimer'
      });
    }

    // Supprimer l'utilisateur
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    await commit(connection);

    console.log(`🗑️ [ADMIN] Utilisateur ID ${id} (${userEmail}) supprimé par admin ID ${req.user.id}`);

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    await rollback(connection);
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

module.exports = router;

