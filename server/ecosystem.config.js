module.exports = {
  apps: [
    {
      name: "redalert-backend",
      script: "./dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000,           
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
    }
  ]
}