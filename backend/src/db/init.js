const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Ensure data directory exists
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

// Initialize the database
const db = require('./index');
console.log('Database initialized successfully!');

// Seed sample data function
function seedSampleData() {
  try {
    // Check if data already exists
    const existingSchemas = db.prepare('SELECT COUNT(*) as count FROM schemas').get();
    
    if (existingSchemas.count > 0) {
      console.log('Data already exists, skipping seeding.');
      return;
    }
    
    console.log('Seeding sample data...');
    
    // Sample schemas
    const schemaStmt = db.prepare(`
      INSERT INTO schemas (name, version, content, service_name) 
      VALUES (?, ?, ?, ?)
    `);
    
    // User Schema v1.0.0
    const userSchema1 = schemaStmt.run(
      'UserSchema', 
      '1.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' }
        },
        required: ['id', 'name']
      }), 
      'user-service'
    );
    
    console.log(`Created UserSchema v1.0.0 with ID: ${userSchema1.lastInsertRowid}`);
    
    // User Schema v1.1.0 (with breaking change)
    const userSchema2 = schemaStmt.run(
      'UserSchema', 
      '1.1.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          phone: { type: 'string' }
        },
        required: ['id', 'name', 'phone']
      }), 
      'user-service'
    );
    
    console.log(`Created UserSchema v1.1.0 with ID: ${userSchema2.lastInsertRowid}`);
    
    // Order Schema
    const orderSchema = schemaStmt.run(
      'OrderSchema', 
      '1.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string' },
          customerId: { type: 'string' },
          items: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' }
              }
            }
          },
          totalAmount: { type: 'number' },
          status: { type: 'string' }
        },
        required: ['id', 'customerId', 'items', 'totalAmount']
      }), 
      'order-service'
    );
    
    console.log(`Created OrderSchema v1.0.0 with ID: ${orderSchema.lastInsertRowid}`);
    
    // Sample deployments
    const deploymentStmt = db.prepare(`
      INSERT INTO deployments (schema_id, environment, status) 
      VALUES (?, ?, ?)
    `);
    
    const deployment1 = deploymentStmt.run(userSchema1.lastInsertRowid, 'dev', 'SUCCESS');
    const deployment2 = deploymentStmt.run(userSchema2.lastInsertRowid, 'staging', 'PENDING');
    const deployment3 = deploymentStmt.run(orderSchema.lastInsertRowid, 'prod', 'SUCCESS');
    
    console.log(`Created ${deployment1.lastInsertRowid}, ${deployment2.lastInsertRowid}, ${deployment3.lastInsertRowid} deployments`);
    
    // Sample dependencies
    const depStmt = db.prepare(`
      INSERT INTO dependencies (producer_service, consumer_service, schema_name)
      VALUES (?, ?, ?)
    `);
    
    const dep1 = depStmt.run('user-service', 'order-service', 'UserSchema');
    const dep2 = depStmt.run('user-service', 'notification-service', 'UserSchema');
    const dep3 = depStmt.run('order-service', 'inventory-service', 'OrderSchema');
    
    console.log(`Created dependencies: ${dep1.lastInsertRowid}, ${dep2.lastInsertRowid}, ${dep3.lastInsertRowid}`);
    
    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seeding function
seedSampleData();