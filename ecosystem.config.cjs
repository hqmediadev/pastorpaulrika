module.exports = {
  apps: [
    {
      name: 'ppr-app',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
