import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = ({ schemas, deployments, dependencies }) => {
  // Separate states for schema and deployment forms
  const [schemaSubmitting, setSchemaSubmitting] = useState(false);
  const [schemaError, setSchemaError] = useState(null);
  const [schemaSuccess, setSchemaSuccess] = useState(null);

  const [deploymentSubmitting, setDeploymentSubmitting] = useState(false);
  const [deploymentError, setDeploymentError] = useState(null);
  const [deploymentSuccess, setDeploymentSuccess] = useState(null);
  
  const [dependencySubmitting, setDependencySubmitting] = useState(false);
  const [dependencyError, setDependencyError] = useState(null);
  const [dependencySuccess, setDependencySuccess] = useState(null);
  
  // State for schema analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Initialize form state from localStorage if available
  const [schemaForm, setSchemaForm] = useState(() => {
    const savedForm = localStorage.getItem('schemaFormData');
    return savedForm ? JSON.parse(savedForm) : {
      name: '',
      version: '',
      service: '',
      content: ''
    };
  });
  
  // State for deployment form with localStorage persistence
  const [deploymentForm, setDeploymentForm] = useState(() => {
    const savedForm = localStorage.getItem('deploymentFormData');
    return savedForm ? JSON.parse(savedForm) : {
      schema_id: '',
      environment: ''
    };
  });
  
  // State for dependency form with localStorage persistence
  const [dependencyForm, setDependencyForm] = useState(() => {
    const savedForm = localStorage.getItem('dependencyFormData');
    return savedForm ? JSON.parse(savedForm) : {
      producer_service: '',
      consumer_service: '',
      schema_name: ''
    };
  });
  
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('schemaFormData', JSON.stringify(schemaForm));
  }, [schemaForm]);
  
  useEffect(() => {
    localStorage.setItem('deploymentFormData', JSON.stringify(deploymentForm));
  }, [deploymentForm]);
  
  useEffect(() => {
    localStorage.setItem('dependencyFormData', JSON.stringify(dependencyForm));
  }, [dependencyForm]);
  
  // Handle schema form field changes
  const handleSchemaInputChange = (e) => {
    const { name, value } = e.target;
    setSchemaForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Handle deployment form changes
  const handleDeploymentInputChange = (e) => {
    const { name, value } = e.target;
    setDeploymentForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Handle dependency form changes
  const handleDependencyInputChange = (e) => {
    const { name, value } = e.target;
    setDependencyForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Handle schema registration
  const handleSchemaSubmit = async (event) => {
    event.preventDefault();
    setSchemaSubmitting(true);
    setSchemaError(null);
    setSchemaSuccess(null);
    setAnalysisResult(null); // Reset analysis result
    
    try {
      const formData = {
        name: schemaForm.name,
        version: schemaForm.version,
        service_name: schemaForm.service,
        content: JSON.parse(schemaForm.content)
      };
      
      const result = await api.createSchema(formData);
      
      setSchemaSuccess('Schema registered successfully!');
      
      // If this is a new version with analysis, show it
      if (result.analysis) {
        setAnalysisResult(result.analysis);
      }
      
      // Reset form and localStorage
      setSchemaForm({
        name: '',
        version: '',
        service: '',
        content: ''
      });
      localStorage.removeItem('schemaFormData');
      
      // Don't auto-reload if we have analysis to show
      if (!result.analysis) {
        // Reload the page after 2 seconds to refresh data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error registering schema:', error);
      setSchemaError(error.message || 'Failed to register schema. Please try again.');
    } finally {
      setSchemaSubmitting(false);
    }
  };
  
  // Handle deployment form submission
  const handleDeploymentSubmit = async (event) => {
    event.preventDefault();
    setDeploymentSubmitting(true);
    setDeploymentError(null);
    setDeploymentSuccess(null);
    
    try {
      const formData = {
        schema_id: parseInt(deploymentForm.schema_id),
        environment: deploymentForm.environment,
        status: 'PENDING'
      };
      
      await api.createDeployment(formData);
      
      setDeploymentSuccess('Deployment created successfully!');
      
      // Reset form and localStorage
      setDeploymentForm({
        schema_id: '',
        environment: ''
      });
      localStorage.removeItem('deploymentFormData');
      
      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error creating deployment:', error);
      setDeploymentError(error.message || 'Failed to create deployment. Please try again.');
    } finally {
      setDeploymentSubmitting(false);
    }
  };
  
  // Handle dependency form submission
  const handleDependencySubmit = async (event) => {
    event.preventDefault();
    setDependencySubmitting(true);
    setDependencyError(null);
    setDependencySuccess(null);
    
    try {
      const formData = {
        producer_service: dependencyForm.producer_service,
        consumer_service: dependencyForm.consumer_service,
        schema_name: dependencyForm.schema_name
      };
      
      await api.createDependency(formData);
      
      setDependencySuccess('Dependency registered successfully!');
      
      // Reset form and localStorage
      setDependencyForm({
        producer_service: '',
        consumer_service: '',
        schema_name: ''
      });
      localStorage.removeItem('dependencyFormData');
      
      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error registering dependency:', error);
      setDependencyError(error.message || 'Failed to register dependency. Please try again.');
    } finally {
      setDependencySubmitting(false);
    }
  };
  
  // Helper function to get badge color for status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'danger';
      case 'ERROR':
        return 'warning';
      case 'PENDING':
        return 'secondary';
      case 'MONITORING':
        return 'info';
      case 'ROLLED_BACK':
        return 'dark';
      default:
        return 'secondary';
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="dashboard">
      <div className="row">
        <div className="col-md-6">
          <div className="mb-4">
            <h4>Register New Schema</h4>
            
            {schemaError && (
              <div className="alert alert-danger" role="alert">
                {schemaError}
              </div>
            )}
            
            {schemaSuccess && (
              <div className="alert alert-success" role="alert">
                {schemaSuccess}
              </div>
            )}
            
            <form onSubmit={handleSchemaSubmit}>
              <div className="mb-3">
                <label className="form-label">Schema Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  required 
                  value={schemaForm.name || ''}
                  onChange={handleSchemaInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Version</label>
                <input 
                  type="text" 
                  name="version" 
                  className="form-control" 
                  placeholder="1.0.0" 
                  required 
                  value={schemaForm.version || ''}
                  onChange={handleSchemaInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Service</label>
                <input 
                  type="text" 
                  name="service" 
                  className="form-control" 
                  required 
                  value={schemaForm.service || ''}
                  onChange={handleSchemaInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Schema Content (JSON)</label>
                <textarea 
                  name="content" 
                  className="form-control" 
                  rows="5" 
                  required 
                  placeholder="Paste JSON schema here"
                  value={schemaForm.content || ''}
                  onChange={handleSchemaInputChange}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={schemaSubmitting}
              >
                {schemaSubmitting ? 'Registering...' : 'Register Schema'}
              </button>
            </form>
          </div>
          
          {/* Schema Change Analysis */}
          {analysisResult && (
            <div className="mt-4 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5>Schema Change Analysis</h5>
                </div>
                <div className="card-body">
                  {analysisResult.hasBreakingChanges ? (
                    <div className="alert alert-danger">
                      <strong>Breaking Changes Detected!</strong> This schema update contains changes that may break consumers.
                    </div>
                  ) : (
                    <div className="alert alert-success">
                      <strong>Compatible Changes Only.</strong> This schema update is backward compatible.
                    </div>
                  )}
                  
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Breaking Changes ({analysisResult.breaking.length})</h6>
                      {analysisResult.breaking.length === 0 ? (
                        <p className="text-muted">No breaking changes</p>
                      ) : (
                        <ul className="list-group">
                          {analysisResult.breaking.map((change, index) => (
                            <li key={index} className="list-group-item list-group-item-danger">
                              <strong>{change.type}:</strong> {change.description}
                              <div className="text-muted small">Path: {change.path}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <h6>Non-Breaking Changes ({analysisResult.nonBreaking.length})</h6>
                      {analysisResult.nonBreaking.length === 0 ? (
                        <p className="text-muted">No non-breaking changes</p>
                      ) : (
                        <ul className="list-group">
                          {analysisResult.nonBreaking.map((change, index) => (
                            <li key={index} className="list-group-item list-group-item-light">
                              <strong>{change.type}:</strong> {change.description}
                              <div className="text-muted small">Path: {change.path}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Recent Schemas</h4>
            </div>
            <div className="card-body">
              {schemas.length === 0 ? (
                <div className="alert alert-info">
                  No schemas found. Register your first schema to get started!
                </div>
              ) : (
                <div className="list-group">
                  {schemas.slice(0, 5).map(schema => (
                    <div key={schema.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>{schema.name} <small>v{schema.version}</small></h6>
                          <div className="text-muted small">
                            Service: {schema.service_name}
                          </div>
                        </div>
                        <div className="text-muted small">
                          {formatDate(schema.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {deployments.length > 0 && (
            <div className="card mt-4">
              <div className="card-header">
                <h4>Recent Deployments</h4>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {deployments.slice(0, 5).map(deployment => (
                    <div key={deployment.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>{deployment.schema_name} <small>v{deployment.version}</small></h6>
                          <div className="text-muted small">
                            Service: {deployment.service_name} • 
                            Environment: {deployment.environment}
                          </div>
                        </div>
                        <div>
                          <span className={`badge bg-${getStatusBadgeColor(deployment.status)}`}>
                            {deployment.status}
                          </span>
                          <div className="text-muted small">
                            {formatDate(deployment.deployed_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {dependencies.length > 0 && (
            <div className="card mt-4">
              <div className="card-header">
                <h4>Service Dependencies</h4>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {dependencies.slice(0, 5).map((dependency, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>
                            {dependency.producer_service} → {dependency.consumer_service}
                          </h6>
                          <div className="text-muted small">
                            Schema: {dependency.schema_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {schemas.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4>Deploy Schema</h4>
              </div>
              <div className="card-body">
                {deploymentError && (
                  <div className="alert alert-danger" role="alert">
                    {deploymentError}
                  </div>
                )}
                
                {deploymentSuccess && (
                  <div className="alert alert-success" role="alert">
                    {deploymentSuccess}
                  </div>
                )}
                
                <form onSubmit={handleDeploymentSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Select Schema</label>
                    <select 
                      name="schema_id" 
                      className="form-select" 
                      required
                      value={deploymentForm.schema_id}
                      onChange={handleDeploymentInputChange}
                    >
                      <option value="">Select Schema</option>
                      {schemas.map(schema => (
                        <option key={schema.id} value={schema.id}>
                          {schema.name} v{schema.version} ({schema.service_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Environment</label>
                    <select 
                      name="environment" 
                      className="form-select" 
                      required
                      value={deploymentForm.environment}
                      onChange={handleDeploymentInputChange}
                    >
                      <option value="">Select Environment</option>
                      <option value="dev">Development</option>
                      <option value="test">Testing</option>
                      <option value="staging">Staging</option>
                      <option value="prod">Production</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={deploymentSubmitting}
                  >
                    {deploymentSubmitting ? 'Creating...' : 'Create Deployment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4>Register Dependency</h4>
              </div>
              <div className="card-body">
                {dependencyError && (
                  <div className="alert alert-danger" role="alert">
                    {dependencyError}
                  </div>
                )}
                
                {dependencySuccess && (
                  <div className="alert alert-success" role="alert">
                    {dependencySuccess}
                  </div>
                )}
                
                <form onSubmit={handleDependencySubmit}>
                  <div className="mb-3">
                    <label className="form-label">Producer Service</label>
                    <input 
                      type="text" 
                      name="producer_service" 
                      className="form-control" 
                      required
                      value={dependencyForm.producer_service || ''}
                      onChange={handleDependencyInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Consumer Service</label>
                    <input 
                      type="text" 
                      name="consumer_service" 
                      className="form-control" 
                      required
                      value={dependencyForm.consumer_service || ''}
                      onChange={handleDependencyInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Schema Name</label>
                    <select 
                      name="schema_name" 
                      className="form-select" 
                      required
                      value={dependencyForm.schema_name || ''}
                      onChange={handleDependencyInputChange}
                    >
                      <option value="">Select Schema</option>
                      {[...new Set(schemas.map(s => s.name))].map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={dependencySubmitting}
                  >
                    {dependencySubmitting ? 'Registering...' : 'Register Dependency'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;