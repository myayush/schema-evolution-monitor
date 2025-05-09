// Simple script to get metrics for PipelinePulse
// This would integrate with your actual metrics system

// First argument is metric type
// Second argument is service name
const metricType = process.argv[2];
const serviceName = process.argv[3];

function getMetric(type, service) {
  // Mock implementation - in real usage, fetch from monitoring system
  const metrics = {
    'error-rate': {
      // Mock different services with different error rates
      'payment-service': Math.random() * 0.02, // 0-2%
      'user-service': Math.random() * 0.01,    // 0-1%
      'inventory-service': Math.random() * 0.05, // 0-5% 
      // Default for any other service
      'default': Math.random() * 0.03  // 0-3%
    },
    'response-time': {
      'payment-service': 50 + Math.random() * 100,  // 50-150ms
      'user-service': 20 + Math.random() * 50,      // 20-70ms
      'inventory-service': 100 + Math.random() * 200, // 100-300ms
      // Default for any other service
      'default': 75 + Math.random() * 150  // 75-225ms
    }
  };
  
  // Return either the service-specific metric or the default
  const serviceMetrics = metrics[type] || {};
  const value = serviceMetrics[service] || serviceMetrics['default'] || 0;
  
  return value;
}

// Output the metric value for PipelinePulse to capture
console.log(getMetric(metricType, serviceName));

module.exports = { getMetric };