// Format a date for display
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  // Generate a deployment status badge
  export function statusBadge(status) {
    const statusMap = {
      PENDING: 'secondary',
      SUCCESS: 'success',
      FAILED: 'danger',
      ERROR: 'warning',
      MONITORING: 'info',
      ROLLED_BACK: 'dark'
    };
    
    const badgeColor = statusMap[status] || 'secondary';
    
    return `badge bg-${badgeColor}`;
  }
  
  // Format JSON for display
  export function formatJson(json) {
    if (typeof json === 'string') {
      try {
        json = JSON.parse(json);
      } catch (e) {
        return json;
      }
    }
    
    return JSON.stringify(json, null, 2);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }