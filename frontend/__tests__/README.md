# Frontend Test Suite

This directory contains test files for the frontend application.

## Test Structure

- `__tests__/api/` - API route tests (Next.js API routes)
- `__tests__/services/` - Service layer tests (API clients)
- `__tests__/integration/` - Integration tests (requires running backend)

## Running Tests

### Unit Tests (Mocked)
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Integration Tests (Requires Backend Running)
```bash
# First, ensure backend services are running
cd ../backend
docker-compose up -d

# Then run integration tests
npm test -- api-integration.test.ts
```

## Test Files

### API Route Tests
- `api/auth/login.test.ts` - Login endpoint tests
- `api/users/users.test.ts` - Users CRUD endpoint tests
- `api/roles/roles.test.ts` - Roles CRUD endpoint tests
- `api/permissions/permissions.test.ts` - Permissions CRUD endpoint tests

### Service Tests
- `services/auth.service.test.ts` - Authentication service tests
- `services/users-api.service.test.ts` - Users API service tests
- `services/roles-api.service.test.ts` - Roles API service tests
- `services/permissions-api.service.test.ts` - Permissions API service tests

### Integration Tests
- `integration/api-integration.test.ts` - End-to-end API integration tests

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Ensure backend services are running for integration tests:
```bash
cd ../backend
docker-compose up -d
npm run seed  # Seed database with test data
```

## Test Environment Variables

Set these in your `.env.local` file:
```
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API=http://localhost:3000/api
```

## Writing New Tests

1. Create test files with `.test.ts` or `.spec.ts` extension
2. Use Jest and React Testing Library for component tests
3. Mock external dependencies (API calls, localStorage, etc.)
4. Follow the existing test patterns in this directory
