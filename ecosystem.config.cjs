module.exports = {
  apps: [{
    name: 'kaolack-backend',
    script: './backend/server.production.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/kaolack-error.log',
    out_file: './logs/kaolack-out.log',
    log_file: './logs/kaolack-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
