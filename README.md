# 🚀 API Gateway (NestJS + Express)

## 📌 Overview

This project is a **minimal but production-grade API Gateway** built with **NestJS (Express)**.
It serves as the **only public-facing entry point** to your microservices architecture.

---

## ✨ Features

- **🔀 Routing & Proxying**
  Configurable forwarding of requests to backend services via `config/services.json`.

- **🔐 JWT Authentication**
  Validates tokens using a shared secret and injects decoded user info into the request.

- **🛡️ RBAC (Role-Based Access Control)**
  Configurable via `config/rbac.json` with **wildcard permission support** (e.g., `service1.*`, `service1.resource.*`, or `*`).

- **📋 Audit Logging**
  Logs every request (success, failure, denied) into MongoDB.

- **🌐 Public Route Support**
  Routes can be marked `public: true` in `services.json` to bypass JWT and RBAC checks (e.g., `/auth/login`).

- **🧪 Mock Services for Dev/Test**
  - `dev/auth.mock.ts` → Issues JWT tokens (`/login`)
  - `dev/service1.mock.ts` → A simple, protected service for testing
    Enables local development without real microservices.

---

## 🗂️ Project Structure

```
src/
│
├── gateway/         # Proxying, JWT, RBAC, Service Registry
├── logging/         # Mongo audit log schema and logging middleware
├── common/          # Health check and shared utilities
├── app.module.ts    # Root NestJS module
├── main.ts          # App entry point
│
config/
├── services.json    # Service routing and public route config
└── rbac.json        # Role-based access control rules

dev/
├── auth.mock.ts     # Mock authentication service
└── service1.mock.ts # Mock protected service
```

---

## ⚙️ Configuration

### 🔧 `config/services.json`

```json
{
  "routes": [
    {
      "prefix": "/api/v1/auth",
      "target": "http://auth:4000",
      "stripPrefix": true,
      "timeout": 30000,
      "public": true
    },
    {
      "prefix": "/api/v1/service1",
      "target": "http://service1:3001",
      "stripPrefix": true,
      "public": false
    }
  ]
}
```

- **`prefix`**: API Gateway route prefix
- **`target`**: Upstream service URL
- **`stripPrefix`**: Whether to remove the prefix when forwarding
- **`timeout`**: Request timeout in milliseconds
- **`public`**: If true, skips JWT + RBAC validation

---

### 🛡️ `config/rbac.json`

```json
[
  {
    "method": "GET",
    "route": "/api/v1/service1/resource",
    "permissions": ["service1.resource.read"]
  },
  {
    "method": "POST",
    "route": "/api/v1/service1/resource",
    "permissions": ["service1.resource.write"]
  }
]
```

- **`method`**: HTTP method (GET, POST, etc.)
- **`route`**: Exact route path
- **`permissions`**: Required permissions (supports wildcards)

---

## ▶️ Running Locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the API Gateway**

   ```bash
   npm run start:dev
   ```

3. **Run the mock services**

   ```bash
   ts-node dev/auth.mock.ts
   ts-node dev/service1.mock.ts
   ```
