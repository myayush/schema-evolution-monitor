const Database = require('better-sqlite3');
const config = require('../../config');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(config.dbPath);

// Create necessary tables if they don't exist
function initDb() {
  try {
    // Check if tables already exist
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schemas'").get();
    
    if (!tableCheck) {
      console.log('Creating database tables...');
      
      // Schemas table
      db.exec(`
        CREATE TABLE IF NOT EXISTS schemas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          version TEXT NOT NULL,
          content TEXT NOT NULL,
          service_name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(name, version, service_name)
        )
      `);

      // Deployments table
      db.exec(`
        CREATE TABLE IF NOT EXISTS deployments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          schema_id INTEGER NOT NULL,
          environment TEXT NOT NULL,
          status TEXT NOT NULL,
          deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (schema_id) REFERENCES schemas(id)
        )
      `);

      // Dependencies table
      db.exec(`
        CREATE TABLE IF NOT EXISTS dependencies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          producer_service TEXT NOT NULL,
          consumer_service TEXT NOT NULL,
          schema_name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(producer_service, consumer_service, schema_name)
        )
      `);
      
      console.log('Database tables created successfully!');
    } else {
      console.log('Database tables already exist, skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

initDb();

module.exports = db;