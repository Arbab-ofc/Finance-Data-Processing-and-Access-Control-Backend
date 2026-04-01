# API Reference

Base prefix: `/api/v1`

## Auth

### POST `/auth/login`
Request:
```json
{
  "email": "admin@finance.local",
  "password": "Admin@123"
}
```

### GET `/auth/me`
Requires Bearer token or auth cookie.

### POST `/auth/logout`
Clears auth cookie.

## Users (Admin)

### POST `/users`
Create a user with role/status.

### GET `/users`
Query params:
- `page`, `limit`
- `role`, `status`
- `sortBy`, `order`

### GET `/users/:id`
Fetch a single user.

### PATCH `/users/:id`
Allowed fields: `name`, `email`

### PATCH `/users/:id/role`
Allowed values: `viewer`, `analyst`, `admin`

### PATCH `/users/:id/status`
Allowed values: `active`, `inactive`

### PATCH `/users/:id/password-reset`
Reset target user password.

## Records

### POST `/records` (Admin)
```json
{
  "amount": 1250,
  "type": "expense",
  "category": "Food",
  "date": "2025-01-10",
  "description": "Weekly groceries"
}
```

### GET `/records`
Filters:
- `type`, `category`
- `startDate`, `endDate`
- `minAmount`, `maxAmount`
- `page`, `limit`, `sortBy`, `order`

### GET `/records/:id`
Fetch single record.

### PATCH `/records/:id` (Admin)
Any subset of: `amount`, `type`, `category`, `date`, `description`

### DELETE `/records/:id` (Admin)
Hard-delete record.

## Dashboard

### GET `/dashboard/summary`
Returns `totalIncome`, `totalExpenses`, `netBalance`.

### GET `/dashboard/category-breakdown`
Aggregation grouped by `category` and `type`.

### GET `/dashboard/trends`
Monthly grouped totals. Optional:
- `startDate`
- `endDate`

### GET `/dashboard/recent-activity`
Optional:
- `limit` (1-50)
