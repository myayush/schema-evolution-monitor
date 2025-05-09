const express = require('express');
const router = express.Router();
const schemaRegistry = require('../services/schemaRegistry');
const DeploymentModel = require('../models/deployment');
const DependencyModel = require('../models/dependency');

// Schema endpoints
router.get('/schemas', (req, res) => {
  try {
    const schemas = schemaRegistry.getAllSchemas();
    res.json(schemas || []);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/schemas', async (req, res) => {
  try {
    const result = await schemaRegistry.registerSchema(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(400).json({ error: error.message });
  }
});

// Deployment endpoints
router.get('/deployments', (req, res) => {
  try {
    const deployments = DeploymentModel.findAll();
    res.json(deployments || []);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/deployments', (req, res) => {
  try {
    // Ensure schema exists using schemaRegistry
    const schemas = schemaRegistry.getAllSchemas();
    const schema = schemas.find(s => s.id === req.body.schema_id);
    
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    
    const deployment = DeploymentModel.create(req.body);
    
    // For demo purposes, automatically update status to SUCCESS after 3 seconds
    setTimeout(() => {
      try {
        DeploymentModel.updateStatus(deployment.id, 'SUCCESS');
        console.log(`Updated deployment ${deployment.id} status to SUCCESS`);
      } catch (updateError) {
        console.error(`Error updating deployment status: ${updateError.message}`);
      }
    }, 3000);
    
    res.status(201).json(deployment);
  } catch (error) {
    console.error('Error creating deployment:', error);
    res.status(400).json({ error: error.message });
  }
});

// Dependency endpoints
router.get('/dependencies', (req, res) => {
  try {
    const dependencies = DependencyModel.findAll();
    res.json(dependencies || []);
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/dependencies', (req, res) => {
  try {
    const dependency = DependencyModel.create(req.body);
    res.status(201).json(dependency);
  } catch (error) {
    console.error('Error creating dependency:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get impact analysis
router.get('/impact/:service/:schema', (req, res) => {
  try {
    const impact = schemaRegistry.getImpactedServices(
      req.params.service,
      req.params.schema
    );
    res.json(impact);
  } catch (error) {
    console.error('Error analyzing impact:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add an endpoint to update deployment status (for testing purposes)
router.patch('/deployments/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const success = DeploymentModel.updateStatus(parseInt(id), status);
    
    if (success) {
      res.json({ success: true, message: `Deployment status updated to ${status}` });
    } else {
      res.status(404).json({ error: 'Deployment not found' });
    }
  } catch (error) {
    console.error('Error updating deployment status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;