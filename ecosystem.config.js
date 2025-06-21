module.exports = {
  apps: [
    {
      name: "redalert-backend",
      cwd: "/srv/redAlert/server",  // ideálně absolutní cesta
      script: "./dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '300M',
      restart_delay: 5000,
      exec_mode: "fork"
    },
    {
      name: "redalert-frontend",
      cwd: "/srv/redAlert",  // absolutní cesta
      script: "node_modules/.bin/next",  // pokud používáš Next.js frontend
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production"
      },
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '300M',
      restart_delay: 5000,
      exec_mode: "fork"
    },
  ]
}
