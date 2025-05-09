const DeploymentModel = require('../models/deployment');
const SchemaModel = require('../models/schema');
const PipelinePulse = require('pipelinepulse');
const config = require('../../config');

class DeploymentTracker {
  constructor() {
    this.monitoredDeployments = new Map();
    this.initPulsePipeline();
  }

  async initPulsePipeline() {
    this.pulse = new PipelinePulse({
      dbPath: './data/deployment-history.db'
    });
    
    await this.pulse.initialize();
  }

  // Register a new deployment
  async registerDeployment(deploymentData) {
    try {
      // Validate schema exists
      const schema = SchemaModel.findById(deploymentData.schema_id);
      if (!schema) {
        throw new Error(`Schema with ID ${deploymentData.schema_id} not found`);
      }
      
      // Create deployment record
      const deployment = DeploymentModel.create({
        schema_id: deploymentData.schema_id,
        environment: deploymentData.environment,
        status: 'PENDING' // Initial status
      });
      
      // If monitoring is requested, create a canary deployment
      if (deploymentData.monitor === true) {
        await this.monitorDeployment(deployment, schema, deploymentData.monitorConfig);
      }
      
      return deployment;
    } catch (error) {
      console.error('Error registering deployment:', error);
      throw error;
    }
  }

  // Monitor a deployment using PipelinePulse
  async monitorDeployment(deployment, schema, monitorConfig = {}) {
    try {
      const defaultConfig = {
        initialPercentage: 20,
        samplingPeriod: 30,
        errorThreshold: 5
      };
      
      const config = { ...defaultConfig, ...monitorConfig };
      
      // Create a canary deployment pipeline
      const canary = await this.pulse.createCanaryDeployment({
        initialPercentage: config.initialPercentage,
        samplingPeriod: config.samplingPeriod,
        errorThreshold: config.errorThreshold
      });
      
      // Setup deployment commands based on the user's deployment system
      const deployCmd = {
        service: schema.service_name,
        newVersion: schema.version,
        deployCommands: {
          initial: `echo "Deploying ${schema.service_name} at ${config.initialPercentage}% traffic"`,
          update: `echo "Increasing traffic to ${schema.service_name}"`,
          final: `echo "Deployment of ${schema.service_name} complete"`
        },
        rollbackCommands: {
          execute: `echo "Rolling back ${schema.service_name} to previous version"`
        },
        metricsCommands: {
          'error-rate': `echo "0.5"`, // Mock command for demo
          'response-time': `echo "150"` // Mock command for demo
        }
      };
      
      // Store reference to the canary
      this.monitoredDeployments.set(deployment.id, { canary, deployCmd });
      
      // Start monitoring
      return { id: deployment.id, status: 'MONITORING' };
    } catch (error) {
      console.error('Error setting up deployment monitoring:', error);
      throw error;
    }
  }

  // Get all deployments
  getAllDeployments() {
    return DeploymentModel.findAll();
  }

  // Get deployments by service
  getDeploymentsByService(serviceName) {
    return DeploymentModel.findByService(serviceName);
  }

  // Update deployment status
  updateDeploymentStatus(deploymentId, status) {
    return DeploymentModel.updateStatus(deploymentId, status);
  }
}

module.exports = new DeploymentTracker();