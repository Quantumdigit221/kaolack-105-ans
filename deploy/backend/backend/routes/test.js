// Route temporaire pour tester l'expiration de token
const express = require('express');
const router = express.Router();

// Endpoint pour simuler une expiration de token
router.get('/test-expired-token', (req, res) => {
  // Simuler une réponse 403 avec message d'expiration
  res.status(403).json({ 
    error: 'Token expiré',
    code: 'TOKEN_EXPIRED',
    message: 'Votre session a expiré. Veuillez vous reconnecter.'
  });
});

module.exports = router;