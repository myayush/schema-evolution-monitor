const db = require('../db');

const DependencyModel = {
  findAll() {
    try {
      return db.prepare('SELECT * FROM dependencies').all();
    } catch (error) {
      console.error('Error in findAll dependencies:', error);
      return [];
    }
  },
  
  findAffectedServices(producerService, schemaName) {
    try {
      return db.prepare(`
        SELECT * FROM dependencies 
        WHERE producer_service = ? AND schema_name = ?
      `).all(producerService, schemaName);
    } catch (error) {
      console.error('Error finding affected services:', error);
      return [];
    }
  },

  create(dependencyData) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO dependencies (producer_service, consumer_service, schema_name)
        VALUES (?, ?, ?)
      `);
      
      const info = stmt.run(
        dependencyData.producer_service,
        dependencyData.consumer_service,
        dependencyData.schema_name
      );
      
      return { id: info.lastInsertRowid, ...dependencyData };
    } catch (error) {
      console.error('Error creating dependency:', error);
      throw error;
    }
  }
};

module.exports = DependencyModel;