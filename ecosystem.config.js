// Configuration PM2 pour le déploiement en production
// Utilisation: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'aerocheck-backend',
      script: './backend/dist/index.js',
      cwd: '/var/www/AEROCHECK',  // Chemin absolu vers le projet sur le serveur
      env_file: '/var/www/AEROCHECK/.env',
      instances: 1,  // Nombre d'instances (1 pour démarrer, ou 'max' pour utiliser tous les cœurs)
      exec_mode: 'fork',  // 'fork' pour single instance, 'cluster' pour multi-core
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
      },
      
      // Logs
      log_file: '/var/log/pm2/aerocheck-combined.log',
      out_file: '/var/log/pm2/aerocheck-out.log',
      error_file: '/var/log/pm2/aerocheck-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Redémarrage automatique
      autorestart: true,
      watch: false,  // Ne pas surveiller les fichiers en production
      max_restarts: 5,
      min_uptime: '10s',
      
      // Mémoire
      max_memory_restart: '512M',
      
      // Politique de redémarrage
      restart_delay: 3000,
      
      // Monitoring
      monitoring: true,
      
      // Actions avant démarrage
      // pre_exec: 'npm run build',
    }
  ],
  
  // Configuration du déploiement (optionnel)
  deploy: {
    production: {
      user: 'www-data',
      host: ['votre-serveur.com'],
      ref: 'origin/main',
      repo: 'https://github.com/votre-repo/AEROCHECK.git',
      path: '/var/www/AEROCHECK',
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
