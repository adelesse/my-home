// Service wrapper for My Home application
// This script is used by node-windows to create the Windows service

const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'My Home',
  description: 'Personal dashboard with Express backend and Angular frontend',
  script: path.join(__dirname, 'server.js'),
  nodeOptions: ['--harmony', '--max_old_space_size=4096'],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production',
    },
    {
      name: 'PORT',
      value: '3000',
    },
  ],
});

// Listen for the "install" event, which indicates the process is available as a service
svc.on('install', function () {
  console.log('Service My Home installed successfully!');
  console.log('Starting service...');
  svc.start();
});

// Listen for the "start" event
svc.on('start', function () {
  console.log('Service My Home started!');
  console.log('Application available at http://localhost:3000');
});

// Listen for error events
svc.on('error', function (err) {
  console.error('Service error:', err);
});

// Install the script as a service
svc.install();
