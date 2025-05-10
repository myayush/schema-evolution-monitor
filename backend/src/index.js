const express = require('express');
const path = require('path');
const setupApi = require('./api');
const config = require('../config');

// Create Express app
const app = express();

// Initialize database (this will also seed data)
require('./db/init');

// Setup API routes
setupApi(app);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Start the server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server running on port ${config.port}`);
  console.log('Schema Evolution Monitor is running!');
});