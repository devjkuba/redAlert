module.exports = {
  apps: [
    {
      name: "redalert-backend",
      cwd: "./server",
      script: "./dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '300M',
      restart_delay: 5000
    },
    {
      name: 'redalert-frontend',
      cwd: '/srv/redAlert',
      script: 'yarn',
      args: 'start',
      interpreter: 'bash',
      env: {
        PORT: 3000
      },
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '300M',
      restart_delay: 5000
    },
  ]
}