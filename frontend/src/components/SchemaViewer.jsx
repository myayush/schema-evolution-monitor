import React, { useState } from 'react';

// Helper function to format JSON
const formatJson = (json) => {
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch (e) {
      return json;
    }
  }
  
  return JSON.stringify(json, null, 2);
};

const SchemaViewer = ({ schema }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!schema) {
    return <div>No schema selected</div>;
  }
  
  const content = typeof schema.content === 'string' 
    ? JSON.parse(schema.content) 
    : schema.content;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="schema-viewer">
      <div className="row mb-3">
        <div className="col-md-6">
          <h5 className="mb-1">
            {schema.name} <span className="text-muted">v{schema.version}</span>
          </h5>
          <div>
            <span className="badge bg-info me-2">{schema.service_name}</span>
            <small className="text-muted">Created: {formatDate(schema.created_at)}</small>
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'} Content
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="schema-content">
          <pre className="bg-light p-3 border rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <code>{formatJson(content)}</code>
          </pre>
        </div>
      )}
      
      <div className="row mt-3">
        <div className="col">
          <h6>Required Fields</h6>
          {content.required && content.required.length > 0 ? (
            <ul className="list-inline">
              {content.required.map(field => (
                <li key={field} className="list-inline-item">
                  <span className="badge bg-secondary">{field}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No required fields specified</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaViewer;