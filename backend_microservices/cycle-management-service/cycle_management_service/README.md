# Billing Cycle Management Service

## Overview

The Billing Cycle Management Service manages monthly billing cycle operations including:
- Resetting current cycle credit and debit counters to zero at cycle end
- Archiving cycle data for statement generation
- Coordinating interest calculation and statement production processes

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Migration Tool**: Knex.js
- **Testing**: Jest
- **Logging**: Pino
- **Validation**: Zod

## Architecture

The application follows a layered architecture:

```
Controller → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Manage database operations
- **Middleware**: Handle cross-cutting concerns (logging, error handling, context management)

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15 or higher
- npm or pnpm

## Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env file with your configuration
```

## Database Setup

```bash
# Run migrations
npm run migrate:latest

# Rollback migrations
npm run migrate:rollback

# Create new migration
npm run migrate:make migration_name
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start application
npm start
```

### Docker

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## API Endpoints

### Billing Cycle Operations

#### Close Billing Cycle
**POST** `/api/v1/billing/cycle/close`

Request:
```json
{
  "billingCycleEnd": "2024-01-31",
  "processingDate": "2024-02-01"
}
```

Response:
```json
{
  "billingCycle": "2024-01",
  "accountsProcessed": 10543,
  "totalInterestCharged": 125437.89,
  "totalFeesCharged": 34521.00,
  "statementsGenerated": 10543
}
```

### Health Checks

- **GET** `/health/ready` - Readiness check (includes database connectivity)
- **GET** `/health/live` - Liveness check
- **GET** `/v1/billing/health` - Alternative health check endpoint

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Coverage Thresholds

- Statements: ≥ 90%
- Branches: ≥ 90%
- Lines: ≥ 95%
- Functions: ≥ 95%

## Development

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Formatting

```bash
# Format code with Prettier
npm run format
```

## Configuration

All configuration is managed through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | billing_cycle_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_POOL_MIN` | Minimum pool connections | 2 |
| `DB_POOL_MAX` | Maximum pool connections | 10 |
| `LOG_LEVEL` | Logging level | info |
| `LOG_PRETTY` | Pretty print logs | true |
| `CORS_ORIGIN` | CORS origin | * |

## Logging

The service uses structured logging with Pino. All logs include:
- Automatic trace ID propagation
- Request/response logging
- Error tracking with stack traces
- Audit logging for business operations

## Error Handling

All errors follow a standardized format:

```json
{
  "errorCode": "ERROR_CODE",
  "message": "Error description",
  "timestamp": "2024-02-01T10:00:00.000Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {}
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Request validation failed
- `NOT_FOUND` (404) - Resource not found
- `NO_ACTIVE_ACCOUNTS` (422) - Business logic error
- `DATABASE_ERROR` (500) - Database operation failed
- `INTERNAL_SERVER_ERROR` (500) - Unexpected error

## Security

- Sensitive data (account numbers, IDs) are masked in logs
- Database credentials are externalized
- Input validation on all endpoints
- CORS configuration

## OpenAPI Specification

The complete API specification is available at:
`swagger/billing-cycle-openapi.yaml`

Load it in Swagger UI or Redoc for interactive documentation.

## Database Schema

### accounts
- `id` (uuid, primary key)
- `account_number` (string, unique)
- `current_cycle_credit` (decimal)
- `current_cycle_debit` (decimal)
- `status` (enum: ACTIVE, CLOSED, SUSPENDED)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### cycle_archives
- `id` (uuid, primary key)
- `account_id` (uuid, foreign key)
- `billing_cycle` (string, YYYY-MM format)
- `cycle_credit` (decimal)
- `cycle_debit` (decimal)
- `interest_charged` (decimal)
- `fees_charged` (decimal)
- `processing_date` (date)
- `created_at` (timestamp)

## License

ISC
