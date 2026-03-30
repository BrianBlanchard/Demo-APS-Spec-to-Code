# Notification Preference Service

A production-ready microservice for managing customer notification preferences including channel selection, transaction alert thresholds, and marketing opt-in/opt-out settings.

## Features

- ✅ Manage notification preferences per customer
- ✅ Support for multiple channels (email, SMS, push)
- ✅ Transaction alert thresholds
- ✅ Marketing email opt-in/opt-out
- ✅ Audit logging with automatic trace ID propagation
- ✅ PostgreSQL database with migrations
- ✅ Health check endpoints for Kubernetes/Docker
- ✅ Full OpenAPI 3.0 specification
- ✅ Docker and docker-compose support
- ✅ Comprehensive test coverage

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest
- **Container**: Docker

## Architecture

Layered architecture following best practices:

```
Controller → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Data access layer
- **Middleware**: Cross-cutting concerns (logging, validation, errors)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npm run migrate:latest
```

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

### Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
```

## API Endpoints

### Notification Preferences

- **PUT** `/api/v1/customers/{customerId}/notification-preferences`
  - Update customer notification preferences

### Health Checks

- **GET** `/health/ready` - Readiness probe (checks database)
- **GET** `/health/live` - Liveness probe

## API Documentation

OpenAPI specification available at: `swagger/notification-preferences-openapi.yaml`

View in Swagger UI or import into Postman.

## Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Log level | `info` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `notification_preferences` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `CORS_ORIGIN` | CORS origins | `*` |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%

## Database Migrations

```bash
# Run migrations
npm run migrate:latest

# Rollback last migration
npm run migrate:rollback
```

## Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Edge Cases Handled

1. **All notifications disabled**: Allowed, but critical security alerts still sent
2. **Invalid phone number**: SMS automatically disabled, validation error returned
3. **Concurrent updates**: Last write wins (can be changed to optimistic locking)

## Security Features

- No hardcoded secrets (all via environment variables)
- Input validation with Zod
- Centralized error handling with sensitive data masking
- Audit logging with PII masking
- Non-root Docker user
- Health checks for container orchestration

## Monitoring & Observability

- Structured JSON logging with Pino
- Automatic trace ID propagation via AsyncLocalStorage
- Health check endpoints for Kubernetes/Docker
- Audit logging for all preference updates

## Project Structure

```
notification_preference_service/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # HTTP controllers
│   ├── middleware/       # Express middleware
│   ├── repositories/     # Data access layer
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types/DTOs
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── index.ts          # Entry point
├── migrations/           # Database migrations
├── swagger/              # OpenAPI specification
├── __tests__/            # Test files
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest configuration
└── README.md             # This file
```

## License

ISC
