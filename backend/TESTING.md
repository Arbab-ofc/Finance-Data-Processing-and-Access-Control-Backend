# Testing Strategy

This project uses integration-style API tests with:
- Jest
- Supertest
- mongodb-memory-server

## Scope

- auth login/profile/logout
- RBAC enforcement
- user management workflows
- record CRUD and filtering/pagination
- dashboard aggregation endpoints
- validation and error-path handling

## Notes

- Tests run with `NODE_ENV=test` and use ESM mode.
- In restricted sandboxes, mongodb-memory-server may fail to bind local ports. In that case, run tests outside sandbox restrictions.

## Command

```bash
npm test
```
