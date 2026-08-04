module.exports = {
  apps: [
    {
      name: 'job-application-worker',
      script: 'src/scripts/job-application-worker.js',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
