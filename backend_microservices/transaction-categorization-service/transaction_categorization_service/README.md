# Transaction Categorization Service

A production-ready microservice for categorizing financial transactions based on merchant category codes (MCC). Supports interest calculation, rewards eligibility, and regulatory reporting.

## Features

- **MCC to Category Mapping**: Automatically categorizes transactions by merchant category code
- **Interest Rate Calculation**: Provides category-specific interest rates
- **Rewards Eligibility**: Determines if transactions earn rewards and at what rate
- **Default Categorization**: Unknown MCCs assigned to default category (9999)
- **Health Checks**: Kubernetes-ready liveness and readiness probes
- **Audit Logging**: Comprehensive structured logging with automatic trace ID propagation
- **Error Handling**: Centralized error handling with sensitive data masking

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Testing**: Jest
- **Logging**: Pino
- **Validation**: Zod
- **Containerization**: Docker & Docker Compose

## Architecture

Layered architecture following best practices:
```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests, validation, and responses
- **Services**: Pure business logic
- **Repositories**: Database access layer
- **Middleware**: Request context, error handling, validation
- **Audit Service**: Separate logging with data masking

## Prerequisites

- Node.js 20 LTS or higher
- npm 9 or higher
- PostgreSQL 16 (or use Docker Compose)
- Docker & Docker Compose (optional)

## Installation

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL (if not using Docker):
```bash
# Ensure PostgreSQL is running on localhost:5432
```

4. Run migrations:
```bash
npm run migrate:latest
```

5. Start development server:
```bash
npm run dev
```

### Docker Deployment

1. Start all services:
```bash
docker-compose up -d
```

2. Check service health:
```bash
curl http://localhost:3000/health/ready
```

3. Run migrations (inside container):
```bash
docker exec transaction-categorization-service npm run migrate:latest
```

## API Endpoints

### Categorization

**POST /api/v1/transactions/categorize**

Categorize a transaction by merchant category code.

Request:
```json
{
  "merchantCategoryCode": "5411",
  "merchantName": "WHOLE FOODS",
  "amount": 125.50,
  "description": "WHOLE FOODS PURCHASE"
}
```

Response (200 OK):
```json
{
  "transactionType": "01",
  "transactionTypeName": "Purchase",
  "transactionCategory": "5411",
  "categoryName": "Grocery Stores",
  "categoryGroup": "retail",
  "interestRate": 18.99,
  "rewardsEligible": true,
  "rewardsRate": 1.5
}
```

### Health Checks

- **GET /health/live**: Liveness probe (always returns UP if service is running)
- **GET /health/ready**: Readiness probe (checks database connectivity)
- **GET /api/v1/transaction-categorization/health**: Detailed health status

## Configuration

All configuration is externalized via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 3000 |
| LOG_LEVEL | Log level (debug/info/warn/error) | info |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | transaction_categorization |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_POOL_MIN | Minimum connection pool size | 2 |
| DB_POOL_MAX | Maximum connection pool size | 10 |
| CORS_ORIGIN | CORS allowed origins | * |
| CORS_API_DOCS_ORIGIN | CORS for API docs | http://localhost:3000 |

## Database Schema

### transaction_categories

| Column | Type | Description |
|--------|------|-------------|
| category_code | CHAR(4) | Primary key - MCC code |
| category_name | VARCHAR(100) | Category name |
| transaction_type | CHAR(2) | Transaction type (01-06) |
| category_group | VARCHAR(50) | Category grouping |
| interest_rate | DECIMAL(5,2) | Interest rate percentage |
| rewards_eligible | BOOLEAN | Rewards eligibility flag |
| rewards_rate | DECIMAL(5,2) | Rewards percentage |

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode:
```bash
npm run test:watch
```

### Coverage Thresholds

- Statements: ≥ 90%
- Branches: ≥ 90%
- Lines: ≥ 95%
- Functions: ≥ 95%

## Development

### Code Quality

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### Build

Production build:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## OpenAPI Specification

API documentation is available in OpenAPI 3.0 format:

- **File**: `swagger/transaction-categorization-openapi.yaml`
- **Swagger UI**: Import the YAML file into Swagger UI or Redoc

## Docker Commands

Build image:
```bash
docker-compose build
```

Start services:
```bash
docker-compose up -d
```

Stop services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f app
```

## Project Structure

```
transaction_categorization_service/
├── src/
│   ├── controllers/         # HTTP controllers
│   ├── services/           # Business logic
│   ├── repositories/       # Database access
│   ├── dto/               # Request/response DTOs
│   ├── entities/          # Domain entities
│   ├── middleware/        # Express middleware
│   ├── config/           # Configuration files
│   ├── utils/            # Utilities (logger)
│   ├── types/            # TypeScript types
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── migrations/           # Database migrations
├── swagger/             # OpenAPI specification
├── __tests__/          # Test files
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

## Error Handling

All errors follow a standard format:

```json
{
  "errorCode": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Common error codes:
- `VALIDATION_ERROR`: Request validation failed
- `CATEGORY_NOT_FOUND`: MCC not found (handled gracefully with default)
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_SERVER_ERROR`: Unexpected error

## Logging

Structured JSON logging with automatic trace ID propagation:

```json
{
  "level": "info",
  "time": "2024-01-15T10:30:00.000Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "msg": "Transaction categorized successfully",
  "mcc": "5411",
  "category": "Grocery Stores"
}
```

Sensitive data (amounts, merchant names, IDs) are automatically masked in audit logs.

## Graceful Shutdown

The service handles SIGTERM and SIGINT signals gracefully:
1. Stops accepting new connections
2. Completes in-flight requests
3. Closes database connections
4. Exits cleanly

Forced shutdown after 10 seconds if graceful shutdown fails.

## License

MIT
