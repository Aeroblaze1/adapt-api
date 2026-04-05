# Adaptive API Behavior Intelligence Platform

> Adaptive API Behavior Intelligence Platform is a real-time, multi-tenant reverse proxy gateway that monitors, analyzes, and controls API traffic based on dynamic usage behavior.

It sits between client applications and upstream APIs, continuously evaluating request patterns using lightweight, deterministic scoring. Based on observed behavior, it applies progressive enforcement strategies such as throttling, cooldowns, or temporary blocking—before traffic reaches backend systems.

The platform is designed for low-latency decision-making, fail-open resilience, and complete separation of data and control planes, ensuring high performance without compromising reliability.

## What This Is

```text
Client -> Gateway -> Upstream Provider
              |
              v
            Redis Streams -> Event Worker -> WebSocket -> Dashboard
              |
              v
            MongoDB Atlas
```

### Core responsibilities

- validate API keys and provider ownership
- compute real-time request metrics in Redis
- score request behavior deterministically
- map risk to enforcement stages
- publish events for downstream processing
- surface live operational visibility in the dashboard

## Why It’s Interesting

This project is not just a reverse proxy. It combines:

- ⚡ hot-path traffic analysis
- 🧠 deterministic behavior scoring
- 🛡 progressive abuse enforcement
- 📡 event streaming with Redis Streams
- 📊 live dashboard visibility
- 🧪 local and production load testing with k6

## Service Map

- `gateway-service`
  Main reverse proxy and enforcement engine. Handles API key lookup, metrics, behavior scoring, decisions, and request forwarding.

- `event-worker-service`
  Consumes Redis stream events, updates downstream state, runs the baseline scheduler, and pushes live events over WebSocket.

- `control-api-service`
  Read-oriented API for the dashboard. Exposes providers, API keys, alerts, and risk history from MongoDB.

- `dashboard`
  React + Vite frontend for observing providers, API keys, alerts, risk trends, and live traffic behavior.

- `infrastructure/mock-upstream.js`
  Lightweight mock upstream for local verification and demo deployment.

## Key Capabilities

- 🔐 multi-tenant API key validation
- 📈 Redis-backed hot-path metrics
- 🎯 deterministic behavior scoring
- 🚦 progressive enforcement: allow, watch, throttle, cooldown, block
- 📨 Redis Streams event pipeline
- ⚙ asynchronous worker processing
- 📉 adaptive baseline updates
- 🖥 live dashboard updates over WebSocket

## Tech Stack

### Backend

- Node.js
- Express
- Redis / Upstash Redis
- MongoDB / MongoDB Atlas

### Frontend

- React
- Vite
- Recharts
- WebSocket

### Testing

- k6

## Project Structure

```text
adapt-api/
|-- gateway-service/
|-- event-worker-service/
|-- control-api-service/
|-- dashboard/
|-- infrastructure/
|-- load-tests/
|-- load-tests-prod-check/
|-- shared/
|-- tools/
|   `-- k6/
|-- docker-compose.yml
`-- README.md
```

## Runtime Ports

### Local defaults

- gateway: `4000`
- control API: `4500`
- worker WebSocket: `4600`
- dashboard dev server: `5173`
- mock upstream: `5000`

In production on Render, web services bind to the platform-provided `PORT`.

## Environment Variables

### Gateway

Required:

```env
MONGO_URL=...
DB_NAME=adaptive_api_platform
REDIS_URL=rediss://...
```

### Event Worker

Required:

```env
MONGO_URL=...
DB_NAME=adaptive_api_platform
REDIS_URL=rediss://...
```

Optional for local-only WebSocket override:

```env
WS_PORT=4600
```

### Control API

Required:

```env
MONGO_URL=...
DB_NAME=adaptive_api_platform
```

### Dashboard

Local defaults are built into the frontend, but you can also set:

```env
VITE_CONTROL_API_URL=http://localhost:4500
VITE_WORKER_WS_URL=ws://localhost:4600
```

For production:

```env
VITE_CONTROL_API_URL=https://your-control-api-url
VITE_WORKER_WS_URL=wss://your-worker-url
```

## Local Development

### 1. Start infrastructure 🐳

Start local Redis and Mongo:

```powershell
docker-compose up
```

### 2. Seed local Mongo data 🌱

The local seed script targets local Mongo and inserts:

- `providers`
- `api_keys`
- `policies`

Run:

```powershell
node infrastructure/mongo/seed.js
```

### 3. Start the services ▶

Open separate terminals:

```powershell
cd control-api-service
npm install
npm start
```

```powershell
cd gateway-service
npm install
npm start
```

```powershell
cd event-worker-service
npm install
npm start
```

```powershell
cd dashboard
npm install
npm run dev
```

Optional mock upstream:

```powershell
cd infrastructure
npm install
node mock-upstream.js
```

### 4. Quick local checks ✅

Health endpoints:

```powershell
curl http://localhost:4500/health
curl http://localhost:4000/health
```

Control API checks:

```powershell
curl http://localhost:4500/providers
curl "http://localhost:4500/api-keys?providerId=parentA"
```

Gateway request:

```powershell
curl -H "x-api-key: ak_001" http://localhost:4000/api/test
```

## Production Deployment

### Live infrastructure ☁

- backend services on Render
- Redis on Upstash
- MongoDB on MongoDB Atlas
- frontend on Render Static Site

### Recommended deployment order

1. Deploy mock upstream to Render
2. Update Mongo `providers.upstreamUrl` to the deployed upstream URL
3. Deploy `control-api-service`
4. Deploy `gateway-service`
5. Deploy `event-worker-service`
6. Deploy `dashboard`

### Render service mapping

- `infrastructure/mock-upstream.js` -> Render Web Service
- `control-api-service` -> Render Web Service
- `gateway-service` -> Render Web Service
- `event-worker-service` -> Render Web Service
- `dashboard` -> Render Static Site

### Production notes

- 🔒 Upstash Redis should use a `rediss://` URL
- 🗃 Atlas data should exist in the database named by `DB_NAME`
- 🌍 `providers.upstreamUrl` in Mongo must not point to `localhost` in production
- 🔌 dashboard websocket URL must use `wss://`, not `https://`
- 🚀 the worker binds `process.env.PORT` first, so it is Render-compatible

## API Testing

Production API testing should target the deployed gateway, not the dashboard.

### Useful checks

```text
GET https://your-control-api/health
GET https://your-control-api/providers
GET https://your-control-api/api-keys?providerId=parentA
GET https://your-gateway/health
```

### Gateway request

```powershell
curl -H "x-api-key: ak_001" https://your-gateway-url/api/test
```

### Expected outcomes

- `200` when traffic is within policy
- `429` when enforcement escalates
- response headers such as `X-Risk-Score` and `X-Enforcement-Stage`

## Load Testing

There are two load-testing areas in this repo:

- `load-tests/`
  Local-focused scripts aimed at localhost testing.

- `load-tests-prod-check/`
  Production-safe k6 scripts that read target URLs and API keys from env vars instead of hardcoding secrets.

### Local k6 examples 🧪

If `k6` is installed globally:

```powershell
k6 run .\load-tests\load-basic.js
k6 run .\load-tests\load-burst.js
k6 run .\load-tests\load-controlled.js
k6 run .\load-tests\load-multi.js
```

If using the bundled binary:

```powershell
.\tools\k6\k6.exe run .\load-tests\load-basic.js
.\tools\k6\k6.exe run .\load-tests\load-burst.js
.\tools\k6\k6.exe run .\load-tests\load-controlled.js
.\tools\k6\k6.exe run .\load-tests\load-multi.js
```

### Production-safe k6 checks 🌐

Create a local ignored file:

`load-tests-prod-check/.env`

Example:

```env
TARGET_URL=https://your-gateway-url
API_KEY=your_real_key
API_KEYS=key_one,key_two,key_three
API_PATH=/api/test
```

Load env vars in PowerShell:

```powershell
Get-Content .\load-tests-prod-check\.env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $name, $value = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
}
```

Run the scripts:

```powershell
.\tools\k6\k6.exe run .\load-tests-prod-check\basic.js
.\tools\k6\k6.exe run .\load-tests-prod-check\controlled.js
.\tools\k6\k6.exe run .\load-tests-prod-check\burst.js
.\tools\k6\k6.exe run .\load-tests-prod-check\multi.js
```

### What each script is for

- `basic.js`
  Smoke test against the deployed gateway

- `controlled.js`
  Gradual ramp-up to observe behavior changes over time

- `burst.js`
  Short, high-intensity spike to stress burst handling

- `multi.js`
  Rotates across multiple API keys to test per-key isolation

## Dashboard Features

- 🧭 provider selection
- 🔑 API key inspection
- 🚨 alerts view
- 📉 risk graph
- 📡 live event feed over WebSocket

## Design Guarantees

- no synchronous database calls in the hot request path
- Redis-backed O(1)-style metric updates
- deterministic decisioning
- multi-tenant separation via provider and key mapping
- fail-open behavior when Redis is unavailable


## Closing Note

This project is more than a proxy. It is a real-time adaptive traffic intelligence layer that combines enforcement, event streaming, observability, and operational testing into one cohesive system.
