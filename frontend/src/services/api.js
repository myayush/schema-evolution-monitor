import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = {
  // Schemas
  async getSchemas() {
    try {
      const response = await axios.get(`${API_URL}/schemas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schemas:', error);
      return [];
    }
  },
  
  async createSchema(schemaData) {
    try {
      const response = await axios.post(`${API_URL}/schemas`, schemaData);
      return response.data;
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  },
  
  // Deployments
  async getDeployments() {
    try {
      const response = await axios.get(`${API_URL}/deployments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deployments:', error);
      return [];
    }
  },
  
  async createDeployment(deploymentData) {
    try {
      const response = await axios.post(`${API_URL}/deployments`, deploymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating deployment:', error);
      throw error;
    }
  },
  
  // Dependencies
  async getDependencies() {
    try {
      const response = await axios.get(`${API_URL}/dependencies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      return [];
    }
  },
  
  async createDependency(dependencyData) {
    try {
      const response = await axios.post(`${API_URL}/dependencies`, dependencyData);
      return response.data;
    } catch (error) {
      console.error('Error creating dependency:', error);
      throw error;
    }
  },

  // Update the createSchema function in api.js
async createSchema(schemaData) {
    try {
      const response = await axios.post(`${API_URL}/schemas`, schemaData);
      return response.data;
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error.response?.data?.error || error.message || 'Failed to create schema';
    }
  }
};

export default api;