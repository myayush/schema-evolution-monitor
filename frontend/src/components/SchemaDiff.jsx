import React from 'react';

const SchemaDiff = ({ diff }) => {
  if (!diff) {
    return null;
  }
  
  return (
    <div className="schema-diff">
      <div className={`alert ${diff.hasBreakingChanges ? 'alert-danger' : 'alert-success'}`}>
        <h5>
          {diff.hasBreakingChanges 
            ? `⚠️ Breaking Changes Detected (${diff.breaking.length})` 
            : '✅ No Breaking Changes'}
        </h5>
        <p>
          {diff.summary.nonBreakingChangesCount} non-breaking changes found.
        </p>
      </div>
      
      {diff.hasBreakingChanges && (
        <div className="breaking-changes mt-3">
          <h6>Breaking Changes:</h6>
          <ul className="list-group">
            {diff.breaking.map((change, index) => (
              <li key={index} className="list-group-item list-group-item-danger">
                <strong>{change.type}</strong>: {change.description}
                <div className="text-muted small">Path: {change.path}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="non-breaking-changes mt-3">
        <h6>Non-Breaking Changes:</h6>
        <ul className="list-group">
          {diff.nonBreaking.map((change, index) => (
            <li key={index} className="list-group-item list-group-item-light">
              <strong>{change.type}</strong>: {change.description}
              <div className="text-muted small">Path: {change.path}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SchemaDiff;