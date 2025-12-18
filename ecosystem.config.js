module.exports = {
  apps : [{
    name: 'what-app-server-test',
    script: 'dist/main.js',
    autorestart: true,
    restartDelay: 5000,
    maxRestarts: 10,
    error_file: './logs/app-err.log',
  }],
};

