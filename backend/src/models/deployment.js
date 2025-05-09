const db = require('../db');

const DeploymentModel = {
  findAll() {
    try {
      return db.prepare(`
        SELECT d.*, s.name as schema_name, s.version, s.service_name
        FROM deployments d
        JOIN schemas s ON d.schema_id = s.id
        ORDER BY d.deployed_at DESC
      `).all();
    } catch (error) {
      console.error('Error in findAll deployments:', error);
      return [];
    }
  },

  findById(id) {
    try {
      return db.prepare(`
        SELECT d.*, s.name as schema_name, s.version, s.service_name
        FROM deployments d
        JOIN schemas s ON d.schema_id = s.id
        WHERE d.id = ?
      `).get(id);
    } catch (error) {
      console.error('Error in findById deployment:', error);
      return null;
    }
  },

  create(deploymentData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO deployments (schema_id, environment, status)
        VALUES (?, ?, ?)
      `);
      
      const info = stmt.run(
        deploymentData.schema_id,
        deploymentData.environment,
        deploymentData.status || 'PENDING'
      );
      
      return { id: info.lastInsertRowid, ...deploymentData };
    } catch (error) {
      console.error('Error creating deployment:', error);
      throw error;
    }
  },
  
  updateStatus(id, status) {
    try {
      console.log(`Updating deployment ${id} status to ${status}`);
      const stmt = db.prepare(`
        UPDATE deployments 
        SET status = ? 
        WHERE id = ?
      `);
      
      const result = stmt.run(status, id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating deployment status:', error);
      throw error;
    }
  }
};

module.exports = DeploymentModel;