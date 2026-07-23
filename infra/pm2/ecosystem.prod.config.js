// PM2 config for prod — run from VM: pm2 start ecosystem.prod.config.js
module.exports = {
  apps: [
    {
      name: 'registration-backend-prod',
      script: '/var/www/registration-app/backend/server.js',
      cwd: '/var/www/registration-app/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};
