# User Management Service

Admin capabilities to manage user accounts: create, suspend, reactivate, delete, change roles, impersonate for support, and bulk operations. Maintains audit log of all administrative actions.

## Technology Stack

- **Language:** TypeScript 5.x
- **Runtime:** Node.js 20 LTS+
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **Migration:** Knex.js
- **Testing:** Jest
- **Logging:** Pino

## Features

- ✅ Suspend user accounts (temporary or permanent)
- ✅ Invalidate user sessions on suspension
- ✅ Hide user listings on suspension
- ✅ Comprehensive audit logging
- ✅ Request tracing with correlation IDs
- ✅ Health check endpoints
- ✅ Database migrations
- ✅ Docker containerization

## Project Structure

```
user_management_service/
├── src/
│   ├── config/          # Configuration and database setup
│   ├── controllers/     # HTTP request handlers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Types, DTOs, and interfaces
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions and error classes
│   ├── app.ts           # Express app initialization
│   └── index.ts         # Application entry point
├── migrations/          # Database migrations
├── swagger/             # OpenAPI specification
├── __tests__/           # Test files (to be generated)
└── docker-compose.yml   # Docker orchestration

```

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16 or higher
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run migrate:latest
```

4. Start development server:
```bash
npm run dev
```

### Using Docker

1. Start all services with Docker Compose:
```bash
docker-compose up -d
```

2. Check service health:
```bash
curl http://localhost:3000/health
```

3. Stop services:
```bash
docker-compose down
```

## API Endpoints

### Admin User Management

- **POST** `/api/v1/admin/users/{user_id}/suspend` - Suspend user account

### Health Checks

- **GET** `/health` - Overall health status
- **GET** `/health/ready` - Readiness probe
- **GET** `/health/live` - Liveness probe

## API Documentation

OpenAPI specification is available at:
- File: `swagger/user-management-openapi.yaml`
- View with Swagger UI or import into Postman

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
npm run test:coverage
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## Database Schema

### Tables

- **users** - User accounts with status and suspension details
- **admin_audit_log** - Audit trail of all admin actions
- **user_sessions** - Active user sessions
- **user_listings** - User-created listings

## Architecture

The application follows a layered architecture:

```
Controller → Service → Repository → Database
     ↓          ↓
  Validation  Audit Service
     ↓
  Error Handler
```

### Key Principles

- **Separation of Concerns:** Controllers handle HTTP, services contain business logic, repositories manage data access
- **Dependency Injection:** Services and repositories are injected as interfaces
- **Context Propagation:** Request context (traceId, adminId, IP) propagated via AsyncLocalStorage
- **Centralized Error Handling:** Global error handler formats all errors consistently
- **Structured Logging:** All logs include traceId automatically via context

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `SERVICE_NAME` | Service name for logging | `user-management-service` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `user_management` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_POOL_MIN` | Minimum connection pool size | `2` |
| `DB_POOL_MAX` | Maximum connection pool size | `10` |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |
| `LOG_PRETTY` | Pretty-print logs in development | `true` |
| `CORS_ORIGIN` | CORS allowed origin | `*` |

## License

ISC
