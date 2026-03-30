# Transaction Search Service

A high-performance microservice for searching and retrieving transaction history with flexible filtering options.

## Features

- Fast transaction search across millions of records
- Multiple filter criteria: date range, amount range, merchant name, transaction types
- Paginated and sortable results
- Transaction export for statements and reporting
- Caching for frequently accessed transaction lists
- Comprehensive audit logging
- JWT-based authentication and authorization

## Technology Stack

- **Runtime**: Node.js 20 LTS+
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Search Engine**: Elasticsearch (optional)
- **Migration**: Knex.js
- **Testing**: Jest
- **Logging**: Pino (structured logging)
- **Validation**: Zod

## Architecture

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses and validation
- **Services**: Contain business logic
- **Repositories**: Data access layer
- **Middleware**: Context propagation, error handling, validation

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 14+
- npm or pnpm

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables in .env
```

## Configuration

Key environment variables:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

DB_HOST=localhost
DB_PORT=5432
DB_NAME=transaction_db
DB_USER=postgres
DB_PASSWORD=postgres

ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_MAX_RESULTS=10000

CORS_ALLOWED_ORIGINS=*
RATE_LIMIT_REQUESTS_PER_MINUTE=200
REQUEST_TIMEOUT=10000
```

## Database Setup

```bash
# Run migrations
npx knex migrate:latest

# Rollback migrations
npx knex migrate:rollback
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

### Docker Compose

```bash
# Start all services (app, postgres, elasticsearch)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## API Endpoints

### Transaction Search

**POST** `/api/v1/transactions/search`

Search transactions with flexible filters.

**Request Body:**
```json
{
  "accountId": "12345678901",
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "sortBy": "date",
  "sortOrder": "desc",
  "pagination": {
    "page": 1,
    "pageSize": 50
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "transactionId": "1234567890123456",
      "accountId": "12345678901",
      "cardNumber": "************1234",
      "transactionType": "01",
      "transactionTypeName": "Purchase",
      "amount": 125.50,
      "merchantName": "AMAZON.COM",
      "originalTimestamp": "2024-01-15T14:30:00Z",
      "status": "posted"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 50,
    "totalResults": 127,
    "totalPages": 3
  },
  "searchMetadata": {
    "executionTimeMs": 85,
    "appliedFilters": ["dateRange", "accountId"],
    "sortedBy": "date",
    "sortOrder": "desc"
  }
}
```

### Health Endpoints

- **GET** `/health/ready` - Readiness check (includes dependency checks)
- **GET** `/health/live` - Liveness check
- **GET** `/v1/transaction-search/health` - General health status

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch
```

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

## Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## API Documentation

OpenAPI specification is available at:
- File: `swagger/transaction-search-openapi.yaml`
- View in Swagger UI or Redoc

## Security

- JWT Bearer token authentication required
- Rate limiting: 200 requests/minute per user
- Sensitive data masking (card numbers, account IDs)
- Input validation and sanitization
- Audit logging for all operations

## Error Handling

All errors follow a standard format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "At least one search criterion required",
  "timestamp": "2024-01-15T14:30:00Z",
  "traceId": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Logging

Structured logging with automatic trace ID propagation:

```json
{
  "level": "info",
  "time": "2024-01-15T14:30:00.000Z",
  "traceId": "123e4567-e89b-12d3-a456-426614174000",
  "msg": "Transaction search successful"
}
```

## License

ISC
