// Configuration PM2 pour le déploiement en production
// Utilisation: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'aerocheck-backend',
      script: './backend/dist/backend/src/index.js',
      cwd: '/var/www/AEROCHECK',
      env_file: '/var/www/AEROCHECK/.env',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3009,
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
    },
    {
      name: 'aerocheck-frontend',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 3300',
      cwd: '/var/www/AEROCHECK/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        FRONTEND_PORT: 3300,
      },
      log_file: '/var/log/pm2/aerocheck-frontend-combined.log',
      out_file: '/var/log/pm2/aerocheck-frontend-out.log',
      error_file: '/var/log/pm2/aerocheck-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 5,
      min_uptime: '10s',
      max_memory_restart: '256M',
      restart_delay: 3000,
      monitoring: true,
    },
  ],
};
