import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import SchemaViewer from '../components/SchemaViewer';
import api from '../services/api';
import { DependencyGraph } from '../components/visualizations';

const IndexPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedSchema, setSelectedSchema] = useState(null);
  
  // Fetch data handler that can be triggered
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch schemas, deployments, and dependencies
        const [schemasData, deploymentsData, dependenciesData] = await Promise.all([
          api.getSchemas(),
          api.getDeployments(),
          api.getDependencies()
        ]);
        
        setSchemas(schemasData);
        setDeployments(deploymentsData);
        setDependencies(dependenciesData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [refreshTrigger]);
  
  // Handle schema selection
  const handleSchemaSelect = (schema) => {
    setSelectedSchema(schema);
  };
  
  // Get unique services
  const getUniqueServices = () => {
    const services = new Set();
    
    schemas.forEach(schema => {
      services.add(schema.service_name);
    });
    
    dependencies.forEach(dep => {
      services.add(dep.producer_service);
      services.add(dep.consumer_service);
    });
    
    return Array.from(services);
  };
  
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button 
          className="btn btn-primary" 
          onClick={refreshData}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Get summary metrics
  const serviceCount = getUniqueServices().length;
  const deploymentsByStatus = deployments.reduce((acc, dep) => {
    acc[dep.status] = (acc[dep.status] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Schema Evolution Dashboard</h2>
            <button 
              className="btn btn-outline-primary" 
              onClick={refreshData}
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh Data
            </button>
          </div>
          <p className="text-muted">
            Monitor schema changes and deployments across your services
          </p>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h5 className="card-title">Schemas</h5>
              <h2 className="card-text">{schemas.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h5 className="card-title">Deployments</h5>
              <h2 className="card-text">{deployments.length}</h2>
              <div className="small">
                {deploymentsByStatus.SUCCESS && 
                  <span className="badge bg-success me-1">{deploymentsByStatus.SUCCESS} success</span>
                }
                {deploymentsByStatus.PENDING && 
                  <span className="badge bg-secondary me-1">{deploymentsByStatus.PENDING} pending</span>
                }
                {deploymentsByStatus.FAILED && 
                  <span className="badge bg-danger me-1">{deploymentsByStatus.FAILED} failed</span>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h5 className="card-title">Dependencies</h5>
              <h2 className="card-text">{dependencies.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h5 className="card-title">Services</h5>
              <h2 className="card-text">{serviceCount}</h2>
            </div>
          </div>
        </div>
      </div>
      
      {selectedSchema && (
        <div className="row mb-4">
          <div className="col">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4>Schema Details</h4>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedSchema(null)}
                >
                  Close
                </button>
              </div>
              <div className="card-body">
                <SchemaViewer schema={selectedSchema} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {dependencies.length > 0 && (
        <div className="row mb-4">
          <div className="col">
            <div className="card">
              <div className="card-header">
                <h4>Service Dependencies</h4>
              </div>
              <div className="card-body">
                <DependencyGraph 
                  dependencies={dependencies} 
                  services={getUniqueServices()} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Dashboard 
        schemas={schemas}
        deployments={deployments}
        dependencies={dependencies}
        onRefreshData={refreshData}
        onSchemaSelect={handleSchemaSelect}
      />
    </div>
  );
};

export default IndexPage;