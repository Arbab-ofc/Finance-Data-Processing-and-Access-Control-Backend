<div align="center">

# Testing Guide

Integration-level API reliability verification

![Jest](https://img.shields.io/badge/Jest-30.x-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-API%20Integration-14B8A6?style=for-the-badge)
![MongoMemoryServer](https://img.shields.io/badge/mongodb--memory--server-Test%20DB-16A34A?style=for-the-badge)
![Coverage](https://img.shields.io/badge/Scope-All%20Endpoint%20Groups-2563EB?style=for-the-badge)

</div>

---

## Contents

- [Testing Stack](#testing-stack)
- [Suite Coverage](#suite-coverage)
- [How To Run](#how-to-run)
- [Environment Notes](#environment-notes)
- [Expected Outcome](#expected-outcome)
- [Troubleshooting](#troubleshooting)

---

## Testing Stack

- `jest`
- `supertest`
- `mongodb-memory-server`

Test mode characteristics:

- `NODE_ENV=test`
- ESM execution (`NODE_OPTIONS=--experimental-vm-modules`)
- per-test cleanup of collections to keep suites isolated

---

## Suite Coverage

| Suite | File | Coverage Focus |
|---|---|---|
| App Baseline | `src/tests/app.test.js` | health, API root, 404, request id, malformed token path |
| Auth | `src/tests/auth.test.js` | login, me, logout, cookie auth, validation, inactive-user behavior |
| Users | `src/tests/users.test.js` | admin-only user management, validation, duplicate checks, self-deactivate guard |
| Records | `src/tests/records.test.js` | RBAC, CRUD, pagination, filters, enum/date/amount validation |
| Dashboard | `src/tests/dashboard.test.js` | summary, category breakdown, trends, recent activity, auth + validation |

Endpoint groups verified:

- `/health`, `/api/v1`
- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/records/*`
- `/api/v1/dashboard/*`

---

## How To Run

From repository root:

```bash
cd backend
npm test
```

CI-friendly run:

```bash
cd backend
npm run test:ci
```

Watch mode (local development):

```bash
cd backend
npm run test:watch
```

---

## Environment Notes

- No external MongoDB instance is required for tests.
- `mongodb-memory-server` starts an ephemeral MongoDB process automatically.
- If your execution environment blocks local port binding, run tests outside sandbox restrictions.

---

## Expected Outcome

On success, Jest should report:

- all suites passed
- all tests passed
- zero open-handle leaks relevant to app runtime logic

Example (latest verification in this repo):

- `Test Suites: 5 passed, 5 total`
- `Tests: 59 passed, 59 total`

---

## Troubleshooting

### `listen EPERM: operation not permitted 0.0.0.0`

Cause:

- environment/sandbox disallows local socket binding needed by `mongodb-memory-server`

Fix:

- run the test command outside sandbox restrictions

### `Cannot find module 'mongodb-memory-server'`

Cause:

- dependency not installed

Fix:

```bash
cd backend
npm install
```

### Tests pass locally but fail in CI

Checklist:

- ensure CI uses Node version compatible with current dependencies
- ensure `NODE_ENV=test`
- run `npm ci` (or clean install) before `npm run test:ci`
