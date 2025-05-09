import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const DependencyGraph = ({ dependencies, services }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!dependencies || !services || !svgRef.current) return;
    
    // Clear previous visualizations
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create nodes for services
    const nodes = services.map(service => ({
      id: service,
      name: service
    }));
    
    // Create links from dependencies
    const links = dependencies.map(dep => ({
      source: dep.producer_service,
      target: dep.consumer_service,
      schema: dep.schema_name
    }));
    
    // Setup D3 force simulation
    const width = 600;
    const height = 400;
    
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);
    
    // Draw links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);
    
    // Draw nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));
    
    // Add circles for nodes
    node.append("circle")
      .attr("r", 10)
      .attr("fill", "#69b3a2");
    
    // Add service labels
    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.name)
      .attr("font-size", "12px");
    
    // Add schema labels on links
    svg.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("dy", -5)
      .text(d => d.schema);
    
    // Update positions on each simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functionality for nodes
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    return () => {
      simulation.stop();
    };
  }, [dependencies, services]);
  
  return (
    <div className="dependency-graph text-center">
      <p className="text-muted mb-2">Drag nodes to rearrange the graph</p>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export const StatusChart = ({ deployments }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!deployments || !canvasRef.current) return;
    
    // Count deployments by status
    const statusCounts = deployments.reduce((acc, dep) => {
      acc[dep.status] = (acc[dep.status] || 0) + 1;
      return acc;
    }, {});
    
    // Prepare data for chart
    const data = Object.keys(statusCounts).map(status => ({
      status,
      count: statusCounts[status]
    }));
    
    // Colors for different statuses
    const colors = {
      SUCCESS: '#28a745',
      FAILED: '#dc3545',
      PENDING: '#6c757d',
      ERROR: '#ffc107',
      MONITORING: '#17a2b8',
      ROLLED_BACK: '#343a40'
    };
    
    // Set up canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw pie chart
    if (data.length > 0) {
      let total = data.reduce((sum, item) => sum + item.count, 0);
      let startAngle = 0;
      
      data.forEach(item => {
        const sliceAngle = 2 * Math.PI * (item.count / total);
        
        ctx.beginPath();
        ctx.fillStyle = colors[item.status] || '#999';
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, Math.min(width, height) / 2 - 10, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        startAngle += sliceAngle;
      });
      
      // Draw center circle (donut hole)
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // No data
      ctx.font = '14px Arial';
      ctx.fillStyle = '#6c757d';
      ctx.textAlign = 'center';
      ctx.fillText('No deployments', width / 2, height / 2);
    }
    
  }, [deployments]);
  
  return (
    <div className="status-chart text-center">
      <canvas ref={canvasRef} width="200" height="200"></canvas>
      <div className="mt-3">
        <span className="badge bg-success mx-1">Success</span>
        <span className="badge bg-danger mx-1">Failed</span>
        <span className="badge bg-secondary mx-1">Pending</span>
        <span className="badge bg-warning mx-1">Error</span>
        <span className="badge bg-info mx-1">Monitoring</span>
      </div>
    </div>
  );
};