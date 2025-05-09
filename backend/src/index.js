const express = require('express');
const path = require('path');
const setupApi = require('./api');
const config = require('../config');

// Create Express app
const app = express();

// Setup API routes
setupApi(app);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  console.log('Serving static files from frontend/dist');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Get port from environment or use default
const PORT = process.env.PORT || config.port;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Schema Evolution Monitor is running!');
});