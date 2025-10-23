module.exports = {
  apps: [
    {
      name: 'lms-backend',
      script: './server/dist/index.js',
      cwd: '/Users/ramgopal/LMS-SLNCity-V1',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: '/tmp/lms-slncity-logs/backend-error.log',
      out_file: '/tmp/lms-slncity-logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USER: 'lms_user',
        DB_PASSWORD: 'lms_password',
        DB_NAME: 'lms_slncity'
      },
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'lms-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '/Users/ramgopal/LMS-SLNCity-V1',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: '/tmp/lms-slncity-logs/frontend-error.log',
      out_file: '/tmp/lms-slncity-logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'development'
      },
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};

