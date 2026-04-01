# Finance Data Processing and Access Control Backend

Backend-only finance dashboard system focused on API design, access control, validation, data processing, analytics, reliability, testing, and maintainability.

## Assignment Fit

This project is intentionally backend-only and demonstrates:
- layered backend architecture (routes, controllers, services, models, validations, middlewares)
- robust JWT authentication and role-based access control (Viewer, Analyst, Admin)
- strict request validation via `express-validator`
- centralized success/error response format
- MongoDB aggregation-driven dashboard endpoints
- integration tests for all endpoint groups using Jest + Supertest

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication (`jsonwebtoken`)
- password hashing (`bcrypt`)
- security middleware (`helmet`, `cors`, `express-rate-limit`)
- logging (`morgan`)
- validation (`express-validator`)
- testing (`jest`, `supertest`, `mongodb-memory-server`)

## Why MongoDB

MongoDB is a good fit for this assignment because:
- financial records have a flexible, document-style shape that maps cleanly to Mongoose models
- dashboard analytics can be implemented directly using aggregation pipelines
- fast iteration speed for internship-level backend delivery without sacrificing data modeling discipline

## Architecture Overview

- `routes`: endpoint registration and middleware chains
- `controllers`: HTTP layer and response delivery
- `services`: business logic and database interactions
- `models`: Mongoose schemas and model rules
- `middlewares`: auth, RBAC, validation handling, and global error handling
- `validations`: endpoint-level request validation arrays
- `utils`: shared helpers for API responses, async wrappers, JWT, pagination
- `tests`: end-to-end integration tests
- `seeds`: local development data seeding

## Role Definitions

- `viewer`
  - login
  - view profile
  - view records
  - view dashboard analytics
  - no create/update/delete records
  - no user management
- `analyst`
  - same as viewer
  - intended analytics consumer
- `admin`
  - full access
  - create/update/delete records
  - manage users (create, list, update profile/role/status/password)

Inactive users cannot log in.

## API Base

- Base URL: `http://localhost:5000`
- Versioned API prefix: `/api/v1`

## Standard Response Format

Success:
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 1
  }
}
```

Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

## Endpoint List

### Auth
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

### Users (Admin only)
- `POST /api/v1/users`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `PATCH /api/v1/users/:id/role`
- `PATCH /api/v1/users/:id/status`
- `PATCH /api/v1/users/:id/password-reset`

### Financial Records
- `POST /api/v1/records` (Admin)
- `GET /api/v1/records` (Viewer/Analyst/Admin)
- `GET /api/v1/records/:id` (Viewer/Analyst/Admin)
- `PATCH /api/v1/records/:id` (Admin)
- `DELETE /api/v1/records/:id` (Admin)

### Dashboard Analytics
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/category-breakdown`
- `GET /api/v1/dashboard/trends`
- `GET /api/v1/dashboard/recent-activity`

## Folder Structure

```text
backend/
  src/
    config/
    constants/
    controllers/
    middlewares/
    models/
    routes/
    services/
    utils/
    validations/
    tests/
    seeds/
    app.js
    server.js
  .env.example
  .gitignore
  package.json
  README.md
```

## Environment Variables

Create `.env` from `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
AUTH_COOKIE_NAME=token
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
MONGO_MAX_POOL_SIZE=10
```

## Installation

```bash
cd backend
npm install
```

## Run Locally

```bash
npm run dev
```

## Seed Database

```bash
npm run seed
```

## Run Tests

```bash
npm test
```

## Demo Credentials

- Admin: `admin@finance.local` / `Admin@123`
- Analyst: `analyst@finance.local` / `Analyst@123`
- Viewer: `viewer@finance.local` / `Viewer@123`

## Testing Coverage Summary

Integration test suites cover:
- authentication flow
- user management access control and validation
- financial record CRUD permissions and filters
- dashboard analytics endpoints
- baseline app routes and error paths

## Assumptions

- single-tenant backend scope
- no file upload requirements
- JWT is sent in `Authorization: Bearer <token>`
- hard delete is acceptable for records

## Tradeoffs

- no refresh-token mechanism to keep assignment scope focused
- no background job queue since analytics can be handled through query-time aggregation for current data volume
- no soft-delete complexity for records to avoid unnecessary policy overhead

## Future Improvements

- refresh token + token rotation
- audit logs for user management actions
- soft delete support with restore workflows
- OpenAPI/Swagger documentation generation
- CI pipeline for automated test/lint checks
