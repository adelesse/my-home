// Uninstall script for My Home Windows service

const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'My Home',
  script: path.join(__dirname, 'server.js'),
});

// Listen for the "uninstall" event
svc.on('uninstall', function () {
  console.log('Service My Home uninstalled successfully!');
  console.log('The service has been removed.');
});

// Listen for error events
svc.on('error', function (err) {
  console.error('Uninstallation error:', err);
});

// Listen for the "alreadyuninstalled" event
svc.on('alreadyuninstalled', function () {
  console.log('Service My Home is not installed.');
});

// Uninstall the service
svc.uninstall();
