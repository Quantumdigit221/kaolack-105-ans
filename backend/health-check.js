// Health check endpoint pour le VPS
const express = require('express');
const router = express.Router();

// Route de health check
router.get('/health', async (req, res) => {
  try {
    const db = require('../models');
    
    // Test de connexion à la base de données
    await db.sequelize.authenticate();
    
    // Statut du système
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      },
      database: 'connected',
      version: '1.0.0'
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

// Route de test simple
router.get('/test', (req, res) => {
  res.json({
    message: 'API Kaolack 105 Ans - Test OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
