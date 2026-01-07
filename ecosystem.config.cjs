module.exports = {
  apps: [{
    name: 'kaolack-backend',
    script: './backend/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/kaolack-error.log',
    out_file: '/var/log/pm2/kaolack-out.log',
    time: true
  }]
};
