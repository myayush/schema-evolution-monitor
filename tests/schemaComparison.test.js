/*
  Basic test for schema comparison functionality
 */

// Function to compare schemas (copy or import your actual implementation)
function compareSchemas(oldSchema, newSchema) {
  const changes = {
    breaking: [],
    nonBreaking: [],
    hasBreakingChanges: false
  };

  // Check for removed fields (breaking change)
  Object.keys(oldSchema.properties || {}).forEach(key => {
    if (!(key in (newSchema.properties || {}))) {
      changes.breaking.push({
        type: 'FIELD_REMOVED',
        path: key,
        description: `Field '${key}' was removed`
      });
      changes.hasBreakingChanges = true;
    }
  });

  // Check for added fields (non-breaking change)
  Object.keys(newSchema.properties || {}).forEach(key => {
    if (!(key in (oldSchema.properties || {}))) {
      changes.nonBreaking.push({
        type: 'FIELD_ADDED',
        path: key,
        description: `Field '${key}' was added`
      });
    }
  });

  // Check for newly required fields (breaking change)
  const oldRequired = oldSchema.required || [];
  const newRequired = newSchema.required || [];
  
  newRequired.forEach(field => {
    if (!oldRequired.includes(field)) {
      changes.breaking.push({
        type: 'REQUIRED_ADDED',
        path: field,
        description: `Field '${field}' is now required`
      });
      changes.hasBreakingChanges = true;
    }
  });

  return changes;
}

// Simple test cases
describe('Schema Comparison', () => {
  test('should detect breaking changes when fields are removed', () => {
    const oldSchema = {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' }
      }
    };
    
    const newSchema = {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      }
    };
    
    const result = compareSchemas(oldSchema, newSchema);
    
    expect(result.hasBreakingChanges).toBe(true);
    expect(result.breaking.length).toBe(1);
    expect(result.breaking[0].type).toBe('FIELD_REMOVED');
    expect(result.breaking[0].path).toBe('email');
  });

  test('should detect non-breaking changes when fields are added', () => {
    const oldSchema = {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      }
    };
    
    const newSchema = {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        phone: { type: 'string' }
      }
    };
    
    const result = compareSchemas(oldSchema, newSchema);
    
    expect(result.hasBreakingChanges).toBe(false);
    expect(result.nonBreaking.length).toBe(1);
    expect(result.nonBreaking[0].type).toBe('FIELD_ADDED');
    expect(result.nonBreaking[0].path).toBe('phone');
  });

  test('should detect breaking changes when required fields are added', () => {
    const oldSchema = {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' }
      },
      required: ['id', 'name']
    };
    
    const newSchema = {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' }
      },
      required: ['id', 'name', 'email']
    };
    
    const result = compareSchemas(oldSchema, newSchema);
    
    expect(result.hasBreakingChanges).toBe(true);
    expect(result.breaking.length).toBe(1);
    expect(result.breaking[0].type).toBe('REQUIRED_ADDED');
    expect(result.breaking[0].path).toBe('email');
  });
});