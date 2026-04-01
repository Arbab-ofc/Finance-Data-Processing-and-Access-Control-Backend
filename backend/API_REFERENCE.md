<div align="center">

# API Reference

Finance Data Processing and Access Control Backend

![API](https://img.shields.io/badge/API-v1-0EA5E9?style=for-the-badge)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Cookie-111827?style=for-the-badge)
![RBAC](https://img.shields.io/badge/RBAC-viewer%20%7C%20analyst%20%7C%20admin-2563EB?style=for-the-badge)
![Response](https://img.shields.io/badge/Response-Standardized-16A34A?style=for-the-badge)

</div>

---

## Contents

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [System Endpoints](#system-endpoints)
- [Auth Endpoints](#auth-endpoints)
- [User Endpoints](#user-endpoints-admin-only)
- [Record Endpoints](#record-endpoints)
- [Dashboard Endpoints](#dashboard-endpoints)
- [Common Errors](#common-errors)

---

## Base URLs

- Health: `/health`
- API root: `/api/v1`
- Versioned endpoints: `/api/v1/...`

---

## Authentication

Protected endpoints accept either:

- `Authorization: Bearer <token>`
- auth cookie (`AUTH_COOKIE_NAME`, default: `token`)

Access model:

- `viewer`: read profile/records/dashboard
- `analyst`: same as viewer
- `admin`: full user + record management

---

## Response Format

Success envelope:

```json
{
  "success": true,
  "message": "Records fetched successfully",
  "requestId": "f2c2f4b5-0a9d-4a4f-8ff1-77887f4c6a18",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 1
  }
}
```

Error envelope:

```json
{
  "success": false,
  "message": "Validation failed",
  "requestId": "f2c2f4b5-0a9d-4a4f-8ff1-77887f4c6a18",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

---

## System Endpoints

### `GET /health`

- Access: Public
- Purpose: Health check for app/runtime readiness

Sample response:

```json
{
  "success": true,
  "message": "Server is healthy",
  "requestId": "a8eb7c2b-8275-49f8-b84f-6b0e2fdf1a7a"
}
```

### `GET /api/v1`

- Access: Public
- Purpose: API availability check

Sample response:

```json
{
  "success": true,
  "message": "Finance API v1 is running"
}
```

---

## Auth Endpoints

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | rate-limited + validated |
| GET | `/api/v1/auth/me` | Authenticated | returns current user |
| POST | `/api/v1/auth/logout` | Authenticated | clears auth cookie |

### `POST /api/v1/auth/login`

Request body:

```json
{
  "email": "admin@finance.local",
  "password": "Admin@123"
}
```

Key validations:

- `email` must be valid email
- `password` minimum length 8

### `GET /api/v1/auth/me`

No body.

### `POST /api/v1/auth/logout`

No body.

---

## User Endpoints (Admin only)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/users` | create user |
| GET | `/api/v1/users` | list users with filters/pagination |
| GET | `/api/v1/users/:id` | get user by id |
| PATCH | `/api/v1/users/:id` | update `name` and/or `email` |
| PATCH | `/api/v1/users/:id/role` | update role |
| PATCH | `/api/v1/users/:id/status` | activate/deactivate user |
| PATCH | `/api/v1/users/:id/password-reset` | reset user password |

### `POST /api/v1/users`

Request body:

```json
{
  "name": "New Viewer",
  "email": "newviewer@finance.local",
  "password": "NewViewer@123",
  "role": "viewer",
  "status": "active"
}
```

### `GET /api/v1/users`

Supported query params:

- `page` (>= 1)
- `limit` (1..100)
- `role` (`viewer`, `analyst`, `admin`)
- `status` (`active`, `inactive`)
- `sortBy` (`name`, `email`, `role`, `status`, `createdAt`)
- `order` (`asc`, `desc`)

### `PATCH /api/v1/users/:id`

Allowed fields:

- `name`
- `email`

At least one field is required.

### `PATCH /api/v1/users/:id/role`

Allowed values:

- `viewer`
- `analyst`
- `admin`

### `PATCH /api/v1/users/:id/status`

Allowed values:

- `active`
- `inactive`

Business rule:

- admin cannot deactivate own account

### `PATCH /api/v1/users/:id/password-reset`

Request body:

```json
{
  "password": "FreshPass@123"
}
```

---

## Record Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/records` | Admin | create record |
| GET | `/api/v1/records` | Authenticated | list/filter records |
| GET | `/api/v1/records/:id` | Authenticated | get record by id |
| PATCH | `/api/v1/records/:id` | Admin | update record |
| DELETE | `/api/v1/records/:id` | Admin | delete record |

### `POST /api/v1/records`

Request body:

```json
{
  "amount": 1250,
  "type": "expense",
  "category": "Food",
  "date": "2025-01-10",
  "description": "Weekly groceries"
}
```

### `GET /api/v1/records`

Supported query params:

- `page`, `limit`
- `type` (`income`, `expense`)
- `category` (allowed finance categories)
- `startDate`, `endDate`
- `minAmount`, `maxAmount`
- `sortBy` (`amount`, `date`, `category`, `type`, `createdAt`)
- `order` (`asc`, `desc`)

Validation constraints:

- `endDate >= startDate`
- `maxAmount >= minAmount`

### `PATCH /api/v1/records/:id`

Allowed fields:

- `amount`
- `type`
- `category`
- `date`
- `description`

At least one field is required.

---

## Dashboard Endpoints

All dashboard endpoints require authentication.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/dashboard/summary` | income/expense/net totals |
| GET | `/api/v1/dashboard/category-breakdown` | grouped totals by category/type |
| GET | `/api/v1/dashboard/trends` | monthly trends |
| GET | `/api/v1/dashboard/recent-activity` | latest records |

### `GET /api/v1/dashboard/trends`

Optional query params:

- `startDate`
- `endDate`

Constraint:

- `endDate >= startDate`

### `GET /api/v1/dashboard/recent-activity`

Optional query params:

- `limit` (1..50)

---

## Common Errors

| Status | Scenario |
|---|---|
| 400 | validation failure / invalid identifier / empty patch payload |
| 401 | missing token / invalid token / bad credentials |
| 403 | inactive account / insufficient role |
| 404 | route not found / resource not found |
| 409 | duplicate email |
| 429 | rate limited |
| 500 | unhandled server error |
