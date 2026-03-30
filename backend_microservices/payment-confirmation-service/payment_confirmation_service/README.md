# Payment Confirmation Service

A production-ready TypeScript/Node.js microservice for retrieving payment confirmations, generating printable receipts, and managing confirmation delivery via multiple channels.

## Features

- **Payment Confirmation Retrieval**: Fetch payment details by confirmation number
- **Multi-Channel Support**: Email, SMS, and downloadable PDF receipts
- **Audit Logging**: Comprehensive activity tracking with automatic trace ID propagation
- **Health Checks**: Liveness and readiness probes for container orchestration
- **Database Integration**: PostgreSQL with Knex.js migrations
- **Error Handling**: Centralized error handling with structured error responses
- **OpenAPI Documentation**: Complete API specification with Swagger support

## Technology Stack

- **Language**: TypeScript 5.x (strict mode)
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Testing**: Jest
- **Validation**: Zod
- **Logging**: Pino (with context propagation via AsyncLocalStorage)
- **Containerization**: Docker & Docker Compose

## Architecture

The service follows a layered architecture pattern:

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses and input validation
- **Services**: Contain business logic
- **Repositories**: Database access layer
- **Middleware**: Error handling, context propagation
- **Cross-Cutting Concerns**: Audit logging, structured logging, error handling

## Project Structure

```
payment_confirmation_service/
├── src/
│   ├── config/           # Configuration (database, logger, async context)
│   ├── controllers/      # HTTP controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types and DTOs
│   └── index.ts          # Application entry point
├── migrations/           # Database migrations
├── __tests__/            # Test files
├── swagger/              # OpenAPI specification
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Container orchestration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher
- PostgreSQL 16 (or use Docker Compose)

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd payment_confirmation_service
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

### Database Setup

Run database migrations:

```bash
npm run migrate:latest
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Production Build

```bash
npm run build
npm start
```

#### Using Docker Compose

```bash
docker-compose up --build
```

This will start:
- Payment Confirmation Service on port 3000
- PostgreSQL database on port 5432

## API Endpoints

### Business APIs

- **GET** `/api/v1/payments/{confirmationNumber}` - Retrieve payment confirmation

### Health Checks

- **GET** `/health/live` - Liveness probe
- **GET** `/health/ready` - Readiness probe (includes database check)
- **GET** `/v1/payment-confirmation/health` - Service-specific health check

## API Documentation

The OpenAPI specification is available at:

```
swagger/payment-confirmation-openapi.yaml
```

To view in Swagger UI:
1. Visit [Swagger Editor](https://editor.swagger.io/)
2. Import the `payment-confirmation-openapi.yaml` file

## Configuration

All configuration is externalized via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | payment_confirmation_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_POOL_MIN` | Min connection pool size | 2 |
| `DB_POOL_MAX` | Max connection pool size | 10 |
| `CORS_ORIGIN` | CORS allowed origins | * |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | info |

## Testing

### Run all tests

```bash
npm test
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Watch mode

```bash
npm run test:watch
```

### Coverage Thresholds

- Statements: ≥ 90%
- Branches: ≥ 90%
- Lines: ≥ 95%
- Functions: ≥ 95%
- Modules: 100%

## Linting & Formatting

### Lint code

```bash
npm run lint
```

### Fix linting issues

```bash
npm run lint:fix
```

### Format code

```bash
npm run format
```

## Error Handling

All errors follow a standard format:

```json
{
  "errorCode": "PAYMENT_NOT_FOUND",
  "message": "Payment confirmation not found",
  "timestamp": "2024-01-15T10:30:00Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Codes

- `PAYMENT_NOT_FOUND` (404): Payment confirmation not found
- `FORBIDDEN` (403): User cannot access the payment
- `VALIDATION_ERROR` (400): Invalid request format
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

## Audit Logging

The service includes comprehensive audit logging:

- Automatic trace ID propagation via AsyncLocalStorage
- Structured JSON logs with Pino
- Sensitive data masking (account IDs, transaction IDs, amounts)
- Request/response logging
- Error tracking with stack traces

## Containerization

### Building Docker Image

```bash
docker build -t payment-confirmation-service .
```

### Running Container

```bash
docker run -p 3000:3000 --env-file .env payment-confirmation-service
```

### Health Checks

The container includes built-in health checks:
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3
- Start period: 10 seconds

## Graceful Shutdown

The service handles SIGTERM and SIGINT signals for graceful shutdown:
1. Stop accepting new connections
2. Close database connections
3. Exit process

## Security

- Non-root user in Docker container
- Input validation with Zod
- Sensitive data masking in logs
- CORS configuration
- TLS/SSL support (configure via reverse proxy)

## License

ISC
