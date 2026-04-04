# ⚡ Adaptive API Behavior Intelligence Platform

A **high-performance, multi-tenant, behavior-aware reverse proxy gateway** that detects API abuse in real time and enforces progressive protection policies.

---

## 🚀 Overview

This system sits between **client companies** and **parent API providers**, analyzing request patterns and dynamically enforcing rate control policies.

```
Client → Gateway → Parent Load Balancer → API Cluster
```

---

## 🎯 Key Capabilities

* 🔐 API Key Validation (multi-tenant aware)
* 📊 Real-time Metrics (Redis hot path)
* 🧠 Behavior Scoring Engine (O(1), deterministic)
* ⚖️ Decision Engine (risk → enforcement stage)
* 🛡️ Progressive Enforcement (throttle, cooldown, block)
* 📡 Event Streaming (Redis Streams)
* ⚙️ Asynchronous Processing (Event Worker)
* 📈 Adaptive Baseline (Hybrid SLA + historical model)
* 🖥️ Terminal-style Observability Dashboard
* ⚡ Real-time WebSocket event streaming

---

## 🧩 System Architecture

```
                ┌──────────────┐
                │   Frontend   │
                │ (Terminal UI)│
                └──────┬───────┘
                       │ WebSocket
                ┌──────▼───────┐
                │ Event Worker │
                │  (Control)   │
                └──────┬───────┘
                       │ Redis Stream
                ┌──────▼───────┐
                │   Gateway    │
                │ (Data Plane) │
                └──────┬───────┘
                       │
              ┌────────▼────────┐
              │ Parent APIs     │
              └─────────────────┘
```

---

## 🧠 Core Concepts

### 🔹 Behavior Scoring

Risk score is computed using:

* Frequency deviation
* Burst detection
* Violation history
* Endpoint sensitivity

```
riskScore ∈ [0,1]
```

---

### 🔹 Hybrid Baseline Model

```
effectiveBaseline = max(SLA_baseline, historicalMovingAverage)
```

* Prevents unfair throttling
* Adapts to legitimate growth
* Guards against abuse inflation

---

### 🔹 Enforcement Stages

| Stage    | Action          |
| -------- | --------------- |
| NORMAL   | Allow           |
| WATCH    | Monitor         |
| THROTTLE | Delay           |
| COOLDOWN | Temporary block |
| BLOCK    | Hard block      |

---

## 🧱 Tech Stack

### Backend

* Node.js (Gateway, Worker, Control API)
* Express.js
* Redis (metrics + streams)
* MongoDB (cold storage)

### Frontend

* React (Vite)
* Recharts
* WebSocket (real-time feed)

---

## 📦 Project Structure

```
adaptive-api-platform/
│
├── gateway-service/        # Data plane (core proxy)
├── event-worker-service/   # Stream consumer + baseline engine
├── control-api-service/    # Mongo query layer
├── dashboard/              # Terminal-style UI
├── tools/
│   └── k6/                 # K6 load testing scripts
├── docker-compose.yml
```

---

## ⚙️ Local Setup

### 1️⃣ Start Dependencies

```bash
docker-compose up
```

---

### 2️⃣ Start Services

```bash
# Gateway
cd gateway-service
node src/server.js

# Worker
cd event-worker-service
node src/worker.js

# Control API
cd control-api-service
node src/server.js

# Frontend
cd dashboard
npm run dev
```

---

## 🔌 Ports

| Service     | Port |
| ----------- | ---- |
| Gateway     | 4000 |
| Control API | 4500 |
| WebSocket   | 4600 |
| Frontend    | 5173 |

---

## 🧪 Testing

### 🔹Quick Load Tests (curl)

#### Burst Test

```bash
for i in {1..100}; do curl -H "x-api-key: ak_001" http://localhost:4000/api/test & done; wait
```

#### Sustained Load

```bash
for i in {1..300}; do curl -H "x-api-key: ak_001" http://localhost:4000/api/test; sleep 0.2; done
```

#### Continuous Load

```bash
while true; do curl -H "x-api-key: ak_001" http://localhost:4000/api/test; sleep 0.05; done
```

---

### 🔹 K6 Load Testing

Comprehensive load testing with real-time metrics, virtual users, and detailed performance insights.

#### Install K6

**macOS**
```bash
brew install k6
```

**Windows (PowerShell)**
```powershell
choco install k6
# or download from [https://k6.io/docs/getting-started/installation/](https://github.com/grafana/k6/releases)
```


#### Run K6 Tests

**macOS/Linux**
```bash
cd tools/k6

# Basic load test
k6 run load-basic.js

# Burst load test (sudden spike)
k6 run load-burst.js

# Controlled ramp-up test
k6 run load-controlled.js

# Multi-endpoint test
k6 run load-multi.js
```

**Windows (PowerShell)**
```powershell
cd tools\k6

# Basic load test
k6 run load-basic.js

# Burst load test (sudden spike)
k6 run load-burst.js

# Controlled ramp-up test
k6 run load-controlled.js

# Multi-endpoint test
k6 run load-multi.js
```

#### K6 Features

* Real-time metrics and performance insights
* Virtual user (VU) simulation
* Define custom thresholds and pass/fail criteria
* Detailed timeline reports
* Support for complex test scenarios

---

## 📡 Real-Time Pipeline

```
Gateway → Redis Stream → Worker → WebSocket → UI
```

* No polling
* No Mongo in hot path
* Sub-second visibility

---

## 🔒 Design Guarantees

* O(1) request processing
* No synchronous DB calls in hot path
* Multi-tenant isolation
* Deterministic scoring
* Fail-open on Redis failure
* Single decision per request

---

## 🖥️ Dashboard Features

* Terminal-style interface
* Provider + API key selection
* Risk trend visualization
* Real-time event stream
* Alert monitoring

---

## 🚀 Deployment (Overview)

* Backend → Render / Docker
* Frontend → Vercel
* Redis → Upstash
* MongoDB → Atlas

---

## 🔮 Future Enhancements

* Advanced anomaly classification
* ML-assisted scoring (offline)
* Per-endpoint policies
* Rate shaping instead of blocking
* Distributed gateway scaling

---

## 📌 Summary

This project is not just a proxy.

It is a:

> **Real-time adaptive traffic intelligence system for multi-tenant API ecosystems**

---

## 👨‍💻 Author

Built as a system design + backend engineering project focusing on:

* Distributed systems
* Real-time analytics
* API security
* Performance engineering

---
