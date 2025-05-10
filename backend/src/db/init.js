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

// Enhanced seed data function
function seedSampleData() {
  try {
    // Check if data already exists
    const existingSchemas = db.prepare('SELECT COUNT(*) as count FROM schemas').get();
    
    if (existingSchemas.count > 0) {
      console.log('Data already exists, skipping seeding.');
      return;
    }
    
    console.log('Seeding comprehensive sample data...');
    
    // Sample schemas
    const schemaStmt = db.prepare(`
      INSERT INTO schemas (name, version, content, service_name) 
      VALUES (?, ?, ?, ?)
    `);
    
    // 1. User Service Schemas - Evolution over time
    const userSchema1 = schemaStmt.run(
      'UserSchema', 
      '1.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'username', 'email']
      }), 
      'user-service'
    );
    
    // Adding optional fields (non-breaking)
    const userSchema2 = schemaStmt.run(
      'UserSchema', 
      '1.1.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phoneNumber: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'username', 'email']
      }), 
      'user-service'
    );
    
    // Breaking change - removing email, adding profileId
    const userSchema3 = schemaStmt.run(
      'UserSchema', 
      '2.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          profileId: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phoneNumber: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'username', 'profileId']
      }), 
      'user-service'
    );
    
    // 2. Order Service Schemas
    const orderSchema1 = schemaStmt.run(
      'OrderSchema', 
      '1.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          orderId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          orderDate: { type: 'string', format: 'date-time' },
          status: { 
            type: 'string', 
            enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] 
          },
          items: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1 },
                unitPrice: { type: 'number', minimum: 0 },
                discount: { type: 'number', minimum: 0, maximum: 100 }
              },
              required: ['productId', 'quantity', 'unitPrice']
            }
          },
          totalAmount: { type: 'number', minimum: 0 },
          shippingAddress: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' }
            },
            required: ['street', 'city', 'country']
          }
        },
        required: ['orderId', 'userId', 'orderDate', 'status', 'items', 'totalAmount']
      }), 
      'order-service'
    );
    
    // 3. Payment Service Schemas
    const paymentSchema = schemaStmt.run(
      'PaymentSchema', 
      '1.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          paymentId: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          amount: { type: 'number', minimum: 0 },
          currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'JPY'] },
          paymentMethod: { 
            type: 'string', 
            enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER'] 
          },
          status: { 
            type: 'string', 
            enum: ['INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'] 
          },
          paymentDetails: {
            type: 'object',
            properties: {
              cardLastFour: { type: 'string', pattern: '^[0-9]{4}$' },
              expiryMonth: { type: 'integer', minimum: 1, maximum: 12 },
              expiryYear: { type: 'integer', minimum: 2024 },
              cardBrand: { type: 'string', enum: ['VISA', 'MASTERCARD', 'AMEX'] }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['paymentId', 'orderId', 'userId', 'amount', 'currency', 'paymentMethod', 'status']
      }), 
      'payment-service'
    );
    
    // 4. Inventory Service Schema
    const inventorySchema = schemaStmt.run(
      'InventorySchema', 
      '1.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          productId: { type: 'string', format: 'uuid' },
          sku: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          quantity: { type: 'integer', minimum: 0 },
          reservedQuantity: { type: 'integer', minimum: 0 },
          availableQuantity: { type: 'integer', minimum: 0 },
          warehouseLocation: {
            type: 'object',
            properties: {
              warehouseId: { type: 'string' },
              zone: { type: 'string' },
              rack: { type: 'string' },
              shelf: { type: 'string' }
            },
            required: ['warehouseId', 'zone']
          },
          reorderLevel: { type: 'integer', minimum: 0 },
          reorderQuantity: { type: 'integer', minimum: 1 },
          unitCost: { type: 'number', minimum: 0 },
          lastRestockDate: { type: 'string', format: 'date-time' }
        },
        required: ['productId', 'sku', 'name', 'quantity', 'availableQuantity']
      }), 
      'inventory-service'
    );
    
    // 5. Notification Service Schema
    const notificationSchema = schemaStmt.run(
      'NotificationSchema', 
      '1.0.0', 
      JSON.stringify({
        type: 'object',
        properties: {
          notificationId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { 
            type: 'string', 
            enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'] 
          },
          templateId: { type: 'string' },
          data: { 
            type: 'object',
            additionalProperties: true
          },
          status: { 
            type: 'string', 
            enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'] 
          },
          scheduledAt: { type: 'string', format: 'date-time' },
          sentAt: { type: 'string', format: 'date-time' },
          metadata: {
            type: 'object',
            properties: {
              priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
              retryCount: { type: 'integer', minimum: 0 },
              maxRetries: { type: 'integer', minimum: 0 }
            }
          }
        },
        required: ['notificationId', 'userId', 'type', 'templateId', 'status']
      }), 
      'notification-service'
    );
    
    
    const deploymentStmt = db.prepare(`
      INSERT INTO deployments (schema_id, environment, status) 
      VALUES (?, ?, ?)
    `);
    
    // Production deployments (stable)
    deploymentStmt.run(userSchema1.lastInsertRowid, 'prod', 'SUCCESS');
    deploymentStmt.run(orderSchema1.lastInsertRowid, 'prod', 'SUCCESS');
    deploymentStmt.run(paymentSchema.lastInsertRowid, 'prod', 'SUCCESS');
    deploymentStmt.run(inventorySchema.lastInsertRowid, 'prod', 'SUCCESS');
    
    // Staging deployments (testing new versions)
    deploymentStmt.run(userSchema2.lastInsertRowid, 'staging', 'SUCCESS');
    deploymentStmt.run(userSchema3.lastInsertRowid, 'staging', 'MONITORING');
    
    // Development deployments
    deploymentStmt.run(userSchema3.lastInsertRowid, 'dev', 'SUCCESS');
    deploymentStmt.run(notificationSchema.lastInsertRowid, 'dev',  'SUCCESS');
    
    // Failed deployment (to show error handling)
    deploymentStmt.run(userSchema3.lastInsertRowid, 'prod', 'FAILED');
    
    // Complex service dependencies showing microservice architecture
    const depStmt = db.prepare(`
      INSERT INTO dependencies (producer_service, consumer_service, schema_name)
      VALUES (?, ?, ?)
    `);
    
    // User service dependencies
    depStmt.run('user-service', 'order-service', 'UserSchema');
    depStmt.run('user-service', 'payment-service', 'UserSchema');
    depStmt.run('user-service', 'notification-service', 'UserSchema');
    depStmt.run('user-service', 'auth-service', 'UserSchema');
    
    // Order service dependencies
    depStmt.run('order-service', 'payment-service', 'OrderSchema');
    depStmt.run('order-service', 'inventory-service', 'OrderSchema');
    depStmt.run('order-service', 'notification-service', 'OrderSchema');
    depStmt.run('order-service', 'shipping-service', 'OrderSchema');
    
    // Payment service dependencies
    depStmt.run('payment-service', 'notification-service', 'PaymentSchema');
    depStmt.run('payment-service', 'fraud-detection-service', 'PaymentSchema');
    depStmt.run('payment-service', 'audit-service', 'PaymentSchema');
    
    // Inventory service dependencies
    depStmt.run('inventory-service', 'supplier-service', 'InventorySchema');
    depStmt.run('inventory-service', 'warehouse-service', 'InventorySchema');
    
    // Cross-cutting concerns
    depStmt.run('analytics-service', 'order-service', 'OrderSchema');
    depStmt.run('analytics-service', 'payment-service', 'PaymentSchema');
    depStmt.run('monitoring-service', 'user-service', 'UserSchema');
    depStmt.run('monitoring-service', 'order-service', 'OrderSchema');
    
    console.log('Comprehensive sample data seeded successfully!');
    console.log('Created schemas for: user, order, payment, inventory, notification services');
    console.log('Created deployments showing various stages and statuses');
    console.log('Created complex service dependency graph');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seeding function
seedSampleData();