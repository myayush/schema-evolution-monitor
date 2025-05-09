/**
 * Compare two schema versions to identify differences and classify changes
 */
function compareSchemasForBreakingChanges(oldSchema, newSchema) {
    const changes = {
      breaking: [],
      nonBreaking: [],
      summary: {},
      hasBreakingChanges: false
    };
  
    // Helper to determine if a change is breaking
    const isBreakingChange = (type, path, details) => {
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
      Object.keys(oldObj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in newObj)) {
          const change = {
            type: 'FIELD_REMOVED',
            path: currentPath,
            description: `Field '${key}' was removed`
          };
          
          if (isBreakingChange(change.type, change.path)) {
            changes.breaking.push(change);
            changes.hasBreakingChanges = true;
          } else {
            changes.nonBreaking.push(change);
          }
        }
      });
  
      // Fields added or modified
      Object.keys(newObj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in oldObj)) {
          // Field added (non-breaking)
          const change = {
            type: 'FIELD_ADDED',
            path: currentPath,
            description: `Field '${key}' was added`
          };
          changes.nonBreaking.push(change);
        } else if (typeof oldObj[key] !== typeof newObj[key]) {
          // Type changed (breaking)
          const change = {
            type: 'TYPE_CHANGED',
            path: currentPath,
            description: `Type changed from ${typeof oldObj[key]} to ${typeof newObj[key]}`,
            detail: { oldType: typeof oldObj[key], newType: typeof newObj[key] }
          };
          
          if (isBreakingChange(change.type, change.path)) {
            changes.breaking.push(change);
            changes.hasBreakingChanges = true;
          } else {
            changes.nonBreaking.push(change);
          }
        } else if (typeof newObj[key] === 'object' && newObj[key] !== null && 
                  oldObj[key] !== null && !Array.isArray(newObj[key])) {
          // Recursive comparison for nested objects
          compareObjects(oldObj[key], newObj[key], currentPath);
        } else if (Array.isArray(newObj[key]) && Array.isArray(oldObj[key])) {
          // Compare arrays
          compareArrays(oldObj[key], newObj[key], currentPath);
        }
      });
    }
  
    // Compare array schemas (simplified)
    function compareArrays(oldArray, newArray, path) {
      // Check for item type changes
      if (oldArray.length > 0 && newArray.length > 0) {
        if (typeof oldArray[0] !== typeof newArray[0]) {
          const change = {
            type: 'ARRAY_TYPE_CHANGED',
            path,
            description: `Array item type changed from ${typeof oldArray[0]} to ${typeof newArray[0]}`
          };
          
          if (isBreakingChange(change.type, change.path)) {
            changes.breaking.push(change);
            changes.hasBreakingChanges = true;
          } else {
            changes.nonBreaking.push(change);
          }
        }
      }
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
  
  // Generate human-readable diff for display
  function generateHumanReadableDiff(diffResult) {
    let summary = '';
    
    if (diffResult.hasBreakingChanges) {
      summary += `⚠️ Contains ${diffResult.breaking.length} breaking changes: `;
      diffResult.breaking.forEach(change => {
        summary += `\n- ${change.description} at ${change.path}`;
      });
    } else {
      summary += `✅ No breaking changes detected. `;
    }
    
    summary += `\n${diffResult.nonBreaking.length} non-breaking changes found.`;
    
    return summary;
  }
  
  module.exports = {
    compareSchemasForBreakingChanges,
    generateHumanReadableDiff
  };