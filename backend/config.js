module.exports = {
  port: process.env.PORT || 3000,
  dbPath: process.env.DB_PATH || './data/schema-monitor.db',
  schemaValidationInterval: process.env.SCHEMA_VALIDATION_INTERVAL || 60000,
  deploymentMonitorInterval: process.env.DEPLOYMENT_MONITOR_INTERVAL || 30000
};