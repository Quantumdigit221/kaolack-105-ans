module.exports = {
  apps: [
    {
      // ========================================
      # Backend API - Production
      # ========================================
      name: 'kaolack-backend',
      script: './backend/server.production.js',
      instances: 'max', // Utiliser tous les CPU disponibles
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        DB_HOST: process.env.DB_HOST || 'mysql',
        DB_PORT: process.env.DB_PORT || 3306,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        REDIS_HOST: process.env.REDIS_HOST || 'redis',
        REDIS_PORT: process.env.REDIS_PORT || 6379,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        SESSION_SECRET: process.env.SESSION_SECRET,
        UPLOAD_DIR: process.env.UPLOAD_DIR || '/var/www/kaolack/uploads',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info'
      },
      
      // ========================================
      # Configuration des logs
      # ========================================
      error_file: './logs/kaolack-error.log',
      out_file: './logs/kaolack-out.log',
      log_file: './logs/kaolack-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // ========================================
      # Configuration de redémarrage
      # ========================================
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // ========================================
      # Configuration mémoire et CPU
      # ========================================
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // ========================================
      # Configuration du temps d'attente
      # ========================================
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // ========================================
      # Configuration de monitoring
      # ========================================
      pmx: true,
      
      // ========================================
      # Configuration de l'environnement
      # ========================================
      cwd: './backend',
      
      // ========================================
      # Configuration des hooks
      # ========================================
      post_update: [
        'npm install',
        'npm run build'
      ]
    },
    
    {
      // ========================================
      # Frontend Build Process (Optionnel)
      # ========================================
      name: 'kaolack-frontend-build',
      script: 'npm run build:production',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        VITE_API_URL: process.env.VITE_API_URL
      },
      cwd: '.',
      autorestart: false,
      watch: false,
      
      // ========================================
      # Configuration pour le build automatique
      # ========================================
      cron_restart: '0 2 * * *', # Tous les jours à 2h du matin
      
      // ========================================
      # Hooks pour le déploiement
      # ========================================
      post_update: [
        'npm install',
        'npm run build:production'
      ]
    }
  ],
  
  // ========================================
  # Configuration du déploiement
  # ========================================
  deploy: {
    production: {
      user: 'deploy',
      host: ['kaolackcommune.sn'],
      ref: 'origin/main',
      repo: 'git@github.com:kaolack/kaolack-105-ans.git',
      path: '/var/www/kaolack',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:production && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};
