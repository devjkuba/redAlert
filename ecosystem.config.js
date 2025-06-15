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
      name: "redalert-frontend",
      cwd: ".",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
    }
  ]
}