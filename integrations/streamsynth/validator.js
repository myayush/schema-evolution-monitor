// Simple schema validation logic
function validateDataAgainstSchema(data, schema) {
    const errors = [];
    
    // Helper function to validate against a schema
    function validateObject(obj, schemaObj, path = '') {
      // Check all required fields
      Object.keys(schemaObj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        
        // If the field is required but missing
        if (schemaObj[key].required && (obj[key] === undefined || obj[key] === null)) {
          errors.push({
            path: currentPath,
            message: `Required field '${key}' is missing`
          });
          return;
        }
        
        // If field exists, check type
        if (obj[key] !== undefined) {
          const expectedType = schemaObj[key].type;
          const actualType = Array.isArray(obj[key]) ? 'array' : typeof obj[key];
          
          if (expectedType && expectedType !== actualType) {
            errors.push({
              path: currentPath,
              message: `Type mismatch: expected ${expectedType}, got ${actualType}`
            });
          }
          
          // Recursively validate nested objects
          if (actualType === 'object' && schemaObj[key].properties) {
            validateObject(obj[key], schemaObj[key].properties, currentPath);
          }
          
          // Validate arrays
          if (actualType === 'array' && schemaObj[key].items) {
            obj[key].forEach((item, index) => {
              const itemType = Array.isArray(item) ? 'array' : typeof item;
              
              if (schemaObj[key].items.type && schemaObj[key].items.type !== itemType) {
                errors.push({
                    path: `${currentPath}[${index}]`,
                    message: `Type mismatch in array item: expected ${schemaObj[key].items.type}, got ${itemType}`
                  });
                }
                
                // Validate nested objects in arrays
                if (itemType === 'object' && schemaObj[key].items.properties) {
                  validateObject(item, schemaObj[key].items.properties, `${currentPath}[${index}]`);
                }
              });
            }
            
            // Validate enum values
            if (schemaObj[key].enum && !schemaObj[key].enum.includes(obj[key])) {
              errors.push({
                path: currentPath,
                message: `Value '${obj[key]}' not in allowed enum values: ${schemaObj[key].enum.join(', ')}`
              });
            }
          }
        });
      }
      
      // Begin validation
      validateObject(data, schema);
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
    
    module.exports = {
      validateDataAgainstSchema
    };