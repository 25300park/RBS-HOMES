module.exports = {
  apps: [
    {
      name: "front",
      script: "./server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};