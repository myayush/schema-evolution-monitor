const { createPipeline } = require('streamsynth');
const schemaRegistry = require('../../backend/src/services/schemaRegistry');
const SchemaModel = require('../../backend/src/models/schema');
const { validateDataAgainstSchema } = require('./validator');

class SchemaDataProcessor {
  constructor() {
    this.pipelines = new Map();
  }

  // Initialize data stream processing
  initStreams() {
    console.log('Initializing schema data processing streams');
    
    // Get all schemas
    const schemas = SchemaModel.findAll();
    
    // Create pipelines for each schema
    schemas.forEach(schema => {
      this.createSchemaValidationPipeline(schema);
    });
    
    console.log(`Initialized ${this.pipelines.size} data validation streams`);
  }

  // Create a validation pipeline for a schema
  createSchemaValidationPipeline(schema) {
    try {
      const schemaContent = JSON.parse(schema.content);
      const serviceId = `${schema.service_name}-${schema.name}-v${schema.version}`;
      
      // If pipeline already exists, skip
      if (this.pipelines.has(serviceId)) {
        return;
      }
      
      console.log(`Creating data validation pipeline for ${serviceId}`);
      
      // Create a pipeline using StreamSynth
      const pipeline = createPipeline()
        // Mock source for demo - in real use, connect to Kafka or other data source
        .source('in-memory', { name: serviceId })
        // Filter for events belonging to this schema
        .filter(event => event && event.schemaName === schema.name)
        // Validate against the schema
        .transform(event => {
          const validationResult = validateDataAgainstSchema(event, schemaContent);
          return {
            original: event,
            valid: validationResult.valid,
            errors: validationResult.errors,
            timestamp: new Date().toISOString()
          };
        })
        // Only process invalid events
        .filter(result => !result.valid)
        // Send to a sink for alerts/logging
        .sink('console', { prefix: `[SCHEMA_VIOLATION:${serviceId}]` });
      
      // Store the pipeline
      this.pipelines.set(serviceId, pipeline);
      
      // Start the pipeline
      pipeline.start();
      
      return serviceId;
    } catch (error) {
      console.error(`Error creating pipeline for schema ${schema.id}:`, error);
    }
  }

  // Add sample data to a pipeline for validation
  processSampleData(serviceName, schemaName, sampleData) {
    // Find all relevant pipelines for this service/schema
    const schemas = SchemaModel.findByNameAndService(schemaName, serviceName);
    
    if (!schemas || schemas.length === 0) {
      throw new Error(`No schema found for ${serviceName}/${schemaName}`);
    }
    
    // Process with each relevant pipeline
    const results = [];
    
    schemas.forEach(schema => {
      const serviceId = `${schema.service_name}-${schema.name}-v${schema.version}`;
      const pipeline = this.pipelines.get(serviceId);
      
      if (pipeline) {
        // Insert the data into the pipeline's source
        pipeline.getSource().add({
          ...sampleData,
          schemaName: schema.name
        });
        
        results.push({
          pipeline: serviceId,
          processed: true
        });
      }
    });
    
    return results;
  }
}

module.exports = new SchemaDataProcessor();