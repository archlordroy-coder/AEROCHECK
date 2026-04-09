// Configuration PM2 pour le déploiement en production (backend only)
// Utilisation: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'aerocheck-backend',
      script: './backend/dist/backend/src/index.js',
      cwd: '/var/www/AEROCHECK',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3300,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3300,
      },
      log_file: '/var/log/pm2/aerocheck-combined.log',
      out_file: '/var/log/pm2/aerocheck-out.log',
      error_file: '/var/log/pm2/aerocheck-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 5,
      min_uptime: '10s',
      max_memory_restart: '512M',
      restart_delay: 3000,
      monitoring: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
