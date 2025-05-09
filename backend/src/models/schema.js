const db = require('../db');

const SchemaModel = {
  findAll() {
    try {
      return db.prepare('SELECT * FROM schemas ORDER BY created_at DESC').all();
    } catch (error) {
      console.error('Error in findAll schemas:', error);
      return [];
    }
  },

  findById(id) {
    try {
      return db.prepare('SELECT * FROM schemas WHERE id = ?').get(id);
    } catch (error) {
      console.error('Error in findById schema:', error);
      return null;
    }
  },
  
  findByService(serviceName) {
    try {
      return db.prepare('SELECT * FROM schemas WHERE service_name = ? ORDER BY created_at DESC').all(serviceName);
    } catch (error) {
      console.error('Error in findByService schemas:', error);
      return [];
    }
  },

  findByNameAndService(name, serviceName) {
    try {
      return db.prepare(`
        SELECT * FROM schemas 
        WHERE name = ? AND service_name = ? 
        ORDER BY created_at DESC
      `).all(name, serviceName);
    } catch (error) {
      console.error('Error in findByNameAndService schemas:', error);
      return [];
    }
  },

  create(schemaData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO schemas (name, version, content, service_name)
        VALUES (?, ?, ?, ?)
      `);
      
      const info = stmt.run(
        schemaData.name,
        schemaData.version,
        JSON.stringify(schemaData.content),
        schemaData.service_name
      );
      
      return { id: info.lastInsertRowid, ...schemaData };
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  }
};

module.exports = SchemaModel;