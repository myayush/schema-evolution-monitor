# Schema Evolution Monitor

A web application that tracks schema changes across microservices and prevents breaking changes from reaching production.

🚀 **Live Demo:** View Live Demo at 
https://schema-evolution-monitor-14.onrender.com

---

##  Problem Solved

In microservice architectures, services communicate through API contracts (schemas). When these change, they can break dependent services.

This tool provides:

* Real-time tracking of schema changes across services
* Automatic detection of breaking changes
* Visual dependency mapping between services
* Deployment monitoring with status tracking

---

##  Tech Stack

* **Frontend:** React, D3.js
* **Backend:** Node.js, Express
* **Database:** SQLite
* **Integrations:**

  * StreamSynth (data processing)
  * PipelinePulse (deployment monitoring)
* **Deployment:** Render

---

##  Key Features

###  Schema Management

* Register and version schemas
* Detect breaking vs non-breaking changes
* Track schema evolution history

###  Deployment Tracking

* Monitor deployments across environments (dev, staging, prod)
* Track deployment status (success, failed, monitoring)
* Prevent breaking changes from reaching production

###  Dependency Visualization

* Interactive service dependency graph
* Impact analysis for schema changes
* Visual representation of microservice architecture

---

##  Architecture

```
Frontend (React) → API (Express) → SQLite Database
                         ↓
        StreamSynth (Data Processing)
        PipelinePulse (Deployment Monitoring)
```

---

##  Getting Started

1. **Clone the Repository**

```bash
git clone https://github.com/myayush/schema-evolution-monitor.git
cd schema-evolution-monitor
```

2. **Install Dependencies**

```bash
npm install
```

3. **Start the Application**

```bash
npm start
```

Access at http://localhost:5173

---

## 🧪 Try It Yourself - Step by Step Demo

### Step 1: Register Your First Schema

In the "Register New Schema" form, enter:

* **Schema Name:** ProductSchema
* **Version:** 1.0.0
* **Service:** product-service
* **Schema Content:**

```json
{
  "type": "object",
  "properties": {
    "productId": { "type": "string" },
    "name": { "type": "string" },
    "price": { "type": "number" },
    "description": { "type": "string" }
  },
  "required": ["productId", "name", "price"]
}
```

Click "Register Schema" → Schema appears in the "Recent Schemas" section.

### Step 2: Add a Non-Breaking Change

Register version 1.1.0 with an optional field:

```json
{
  "type": "object",
  "properties": {
    "productId": { "type": "string" },
    "name": { "type": "string" },
    "price": { "type": "number" },
    "description": { "type": "string" },
    "brand": { "type": "string" }
  },
  "required": ["productId", "name", "price"]
}
```

Expected: **"Compatible Changes Only"** message.

### Step 3: Create a Breaking Change

Register version 2.0.0 with breaking changes:

```json
{
  "type": "object",
  "properties": {
    "productId": { "type": "string" },
    "name": { "type": "string" },
    "cost": { "type": "number" },
    "brand": { "type": "string" },
    "category": { "type": "string" }
  },
  "required": ["productId", "name", "cost", "category"]
}
```

Expected: **"Breaking Changes Detected!"**

* `FIELD_REMOVED`: Field `price` was removed
* `REQUIRED_ADDED`: Field `category` is now required

### Step 4: Deploy a Schema

In the "Deploy Schema" section:

* Select: ProductSchema v1.0.0 (product-service)
* Environment: dev
* Click "Create Deployment"

Expected: Deployment appears with **PENDING** → changes to **SUCCESS** after a few seconds.

### Step 5: Create Service Dependencies

In the "Register Dependency" form:

* **Producer Service:** product-service
* **Consumer Service:** search-service
* **Schema Name:** ProductSchema
* Click "Register Dependency"

Expected: Dependency graph updates showing new connection.

---

## 📊 What This Demonstrates

* **Schema Evolution:** How APIs change over time (v1.0.0 → v1.1.0 → v2.0.0)
* **Change Detection:** Automatic identification of breaking changes
* **Safety Mechanism:** Preventing dangerous deployments
* **Service Mesh:** Visual representation of service dependencies
* **Deployment Pipeline:** Tracking schema deployments across environments

---

##  Real-World Value

This tool helps teams:

* **Prevent Outages:** Catch breaking changes before production
* **Improve Communication:** Visualize service dependencies
* **Track Changes:** Maintain schema history
* **Coordinate Deployments:** See what's deployed where

---

##  Future Enhancements

* Support for GraphQL schemas
* Integration with CI/CD pipelines
