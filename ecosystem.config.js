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
    },
    {
      name: 'redalert-frontend',
      cwd: '/srv/redAlert',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      autorestart: true,
      watch: false,
    },
  ]
}