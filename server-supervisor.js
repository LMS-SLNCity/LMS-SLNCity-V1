#!/usr/bin/env node

/**
 * LMS SLNCity Server Supervisor
 * Manages backend and frontend processes with auto-restart on crash
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = '/Users/ramgopal/LMS-SLNCity-V1';
const LOG_DIR = '/tmp/lms-slncity-logs';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(service, message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] [${service}] ${message}${colors.reset}`);
}

class ProcessManager {
  constructor() {
    this.processes = {};
    this.restartCounts = {};
    this.maxRestarts = 10;
    this.restartDelay = 3000;
  }

  startBackend() {
    log('MANAGER', 'Starting Backend...', 'yellow');
    
    const backendLog = fs.createWriteStream(path.join(LOG_DIR, 'backend.log'), { flags: 'a' });
    const backendError = fs.createWriteStream(path.join(LOG_DIR, 'backend-error.log'), { flags: 'a' });

    const backend = spawn('node', ['dist/index.js'], {
      cwd: path.join(PROJECT_ROOT, 'server'),
      stdio: ['ignore', backendLog, backendError],
      detached: false
    });

    backend.on('exit', (code, signal) => {
      log('BACKEND', `Exited with code ${code} (signal: ${signal})`, 'red');
      this.restartBackend();
    });

    backend.on('error', (err) => {
      log('BACKEND', `Error: ${err.message}`, 'red');
      this.restartBackend();
    });

    this.processes.backend = backend;
    this.restartCounts.backend = 0;
    log('BACKEND', 'Started successfully (PID: ' + backend.pid + ')', 'green');
  }

  startFrontend() {
    log('MANAGER', 'Starting Frontend...', 'yellow');
    
    const frontendLog = fs.createWriteStream(path.join(LOG_DIR, 'frontend.log'), { flags: 'a' });
    const frontendError = fs.createWriteStream(path.join(LOG_DIR, 'frontend-error.log'), { flags: 'a' });

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', frontendLog, frontendError],
      detached: false,
      shell: true
    });

    frontend.on('exit', (code, signal) => {
      log('FRONTEND', `Exited with code ${code} (signal: ${signal})`, 'red');
      this.restartFrontend();
    });

    frontend.on('error', (err) => {
      log('FRONTEND', `Error: ${err.message}`, 'red');
      this.restartFrontend();
    });

    this.processes.frontend = frontend;
    this.restartCounts.frontend = 0;
    log('FRONTEND', 'Started successfully (PID: ' + frontend.pid + ')', 'green');
  }

  restartBackend() {
    if (!this.restartCounts.backend) this.restartCounts.backend = 0;
    this.restartCounts.backend++;

    if (this.restartCounts.backend > this.maxRestarts) {
      log('BACKEND', `Max restarts (${this.maxRestarts}) exceeded. Giving up.`, 'red');
      return;
    }

    log('BACKEND', `Restarting in ${this.restartDelay}ms (attempt ${this.restartCounts.backend}/${this.maxRestarts})...`, 'yellow');
    setTimeout(() => this.startBackend(), this.restartDelay);
  }

  restartFrontend() {
    if (!this.restartCounts.frontend) this.restartCounts.frontend = 0;
    this.restartCounts.frontend++;

    if (this.restartCounts.frontend > this.maxRestarts) {
      log('FRONTEND', `Max restarts (${this.maxRestarts}) exceeded. Giving up.`, 'red');
      return;
    }

    log('FRONTEND', `Restarting in ${this.restartDelay}ms (attempt ${this.restartCounts.frontend}/${this.maxRestarts})...`, 'yellow');
    setTimeout(() => this.startFrontend(), this.restartDelay);
  }

  start() {
    log('MANAGER', 'LMS SLNCity Server Supervisor Starting...', 'blue');
    console.log('');
    
    this.startBackend();
    setTimeout(() => this.startFrontend(), 2000);

    console.log('');
    log('MANAGER', 'All services started. Press Ctrl+C to stop.', 'green');
    console.log('');
    log('MANAGER', `📊 Backend:  http://localhost:5001`, 'blue');
    log('MANAGER', `📊 Frontend: http://localhost:3000`, 'blue');
    console.log('');
    log('MANAGER', `📝 Logs: ${LOG_DIR}`, 'blue');
    console.log('');
  }

  stop() {
    log('MANAGER', 'Shutting down...', 'yellow');
    
    if (this.processes.backend) {
      this.processes.backend.kill('SIGTERM');
    }
    if (this.processes.frontend) {
      this.processes.frontend.kill('SIGTERM');
    }

    setTimeout(() => {
      log('MANAGER', 'Shutdown complete.', 'green');
      process.exit(0);
    }, 2000);
  }
}

// Create and start manager
const manager = new ProcessManager();
manager.start();

// Handle signals
process.on('SIGINT', () => manager.stop());
process.on('SIGTERM', () => manager.stop());

