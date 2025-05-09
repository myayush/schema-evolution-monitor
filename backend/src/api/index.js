const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

function setupApi(app) {
  // Middleware
  app.use(cors());
  app.use(bodyParser.json({ limit: '1mb' }));
  
  // API routes
  app.use('/api', routes);
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
}

module.exports = setupApi;