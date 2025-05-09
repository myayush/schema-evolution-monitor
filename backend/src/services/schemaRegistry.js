const SchemaModel = require('../models/schema');
const DependencyModel = require('../models/dependency');

/**
 * Compares two schemas and identifies breaking changes
 */
function compareSchemasForBreakingChanges(oldSchema, newSchema) {
  const changes = {
    breaking: [],
    nonBreaking: [],
    summary: {},
    hasBreakingChanges: false
  };

  // Helper to determine if a change is breaking
  const isBreakingChange = (type) => {
    const breakingChangeTypes = [
      'FIELD_REMOVED',
      'TYPE_CHANGED',
      'REQUIRED_ADDED',
      'ENUM_VALUE_REMOVED'
    ];
    
    return breakingChangeTypes.includes(type);
  };

  // Compare object schemas recursively
  function compareObjects(oldObj, newObj, path = '') {
    // Fields removed (breaking change)
    Object.keys(oldObj.properties || {}).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in (newObj.properties || {}))) {
        const change = {
          type: 'FIELD_REMOVED',
          path: currentPath,
          description: `Field '${key}' was removed`
        };
        
        if (isBreakingChange(change.type)) {
          changes.breaking.push(change);
          changes.hasBreakingChanges = true;
        } else {
          changes.nonBreaking.push(change);
        }
      }
    });

    // Fields added or modified
    Object.keys(newObj.properties || {}).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in (oldObj.properties || {}))) {
        // Field added (non-breaking)
        const change = {
          type: 'FIELD_ADDED',
          path: currentPath,
          description: `Field '${key}' was added`
        };
        changes.nonBreaking.push(change);
      } else if ((oldObj.properties[key].type !== newObj.properties[key].type)) {
        // Type changed (breaking)
        const change = {
          type: 'TYPE_CHANGED',
          path: currentPath,
          description: `Type changed from '${oldObj.properties[key].type}' to '${newObj.properties[key].type}'`,
          detail: { 
            oldType: oldObj.properties[key].type, 
            newType: newObj.properties[key].type 
          }
        };
        
        if (isBreakingChange(change.type)) {
          changes.breaking.push(change);
          changes.hasBreakingChanges = true;
        } else {
          changes.nonBreaking.push(change);
        }
      }
    });
    
    // Check for newly required fields
    const oldRequired = oldObj.required || [];
    const newRequired = newObj.required || [];
    
    newRequired.forEach(field => {
      if (!oldRequired.includes(field)) {
        const change = {
          type: 'REQUIRED_ADDED',
          path: field,
          description: `Field '${field}' is now required`
        };
        
        if (isBreakingChange(change.type)) {
          changes.breaking.push(change);
          changes.hasBreakingChanges = true;
        } else {
          changes.nonBreaking.push(change);
        }
      }
    });
  }

  // Start comparison
  compareObjects(oldSchema, newSchema);

  // Generate summary
  changes.summary = {
    breakingChangesCount: changes.breaking.length,
    nonBreakingChangesCount: changes.nonBreaking.length,
    hasBreakingChanges: changes.hasBreakingChanges
  };

  return changes;
}

// Schema Registry Service
class SchemaRegistry {
  constructor() {
    this.cachedSchemas = {};
  }

  // Register a new schema
  async registerSchema(schemaData) {
    try {
      // Validate schema data
      this.validateSchemaData(schemaData);
      
      // Check if this is a new version of an existing schema
      const existingSchemas = SchemaModel.findByNameAndService(
        schemaData.name, 
        schemaData.service_name
      );
      
      let analysis = null;
      let previousVersion = null;
      
      // If previous version exists, analyze changes
      if (existingSchemas && existingSchemas.length > 0) {
        const latestSchema = existingSchemas[0]; // Assuming ordered by created_at DESC
        previousVersion = latestSchema.version;
        
        // Parse content
        const oldContent = JSON.parse(latestSchema.content);
        const newContent = schemaData.content;
        
        // Compare schemas for breaking changes
        analysis = compareSchemasForBreakingChanges(oldContent, newContent);
      }
      
      // Create the new schema in DB
      const newSchema = SchemaModel.create(schemaData);
      
      return {
        schema: newSchema,
        previousVersion,
        analysis,
        isFirstVersion: !previousVersion
      };
    } catch (error) {
      console.error('Error registering schema:', error);
      throw error;
    }
  }

  // Validate schema data format
  validateSchemaData(schemaData) {
    const requiredFields = ['name', 'version', 'content', 'service_name'];
    requiredFields.forEach(field => {
      if (!schemaData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
  }

  // Get dependency impact for a schema change
  getImpactedServices(serviceName, schemaName) {
    // Get directly affected services
    const directlyAffected = DependencyModel.findAffectedServices(serviceName, schemaName);
    
    return {
      directImpact: directlyAffected
    };
  }

  // Get schemas by service
  getSchemasByService(serviceName) {
    return SchemaModel.findByService(serviceName);
  }

  // Get all schemas
  getAllSchemas() {
    return SchemaModel.findAll();
  }
}

module.exports = new SchemaRegistry();