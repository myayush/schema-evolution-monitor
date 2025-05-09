const db = require('./index');
console.log('Database initialized successfully!');

// You can add seed data here if needed
// For example:

function seedSampleData() {
  try {
    // Sample schema
    const schemaStmt = db.prepare(`
      INSERT INTO schemas (name, version, content, service_name) 
      VALUES (?, ?, ?, ?)
    `);
    
    const schema1 = schemaStmt.run(
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
    
    console.log(`Created sample schema with ID: ${schema1.lastInsertRowid}`);
    
    // Sample dependency
    const depStmt = db.prepare(`
      INSERT INTO dependencies (producer_service, consumer_service, schema_name)
      VALUES (?, ?, ?)
    `);
    
    const dep1 = depStmt.run(
      'user-service',
      'order-service',
      'UserSchema'
    );
    
    console.log(`Created sample dependency with ID: ${dep1.lastInsertRowid}`);
    
    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

if (process.env.NODE_ENV === 'production') {
  console.log('Seeding demo data for production environment...');
  seedSampleData();
}