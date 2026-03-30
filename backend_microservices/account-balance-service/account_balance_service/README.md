# Account Balance Service

Real-time account balance management service with atomic transaction processing to ensure financial accuracy.

## Features

- **Atomic Balance Updates**: Database row-level locking ensures transaction consistency
- **Real-time Balance Retrieval**: Redis caching with 30-second TTL for optimal performance
- **Credit Validation**: Prevents overdraft beyond configured credit limits
- **Cycle Tracking**: Maintains separate credit/debit totals per billing cycle
- **Event Publishing**: Kafka integration for balance update notifications
- **Audit Logging**: Comprehensive logging with sensitive data masking
- **Health Monitoring**: Kubernetes-ready liveness and readiness probes

## Technology Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Queue**: Kafka
- **Testing**: Jest
- **Container**: Docker

## Architecture

```
Controller → Service → Repository → Database
                ↓
         Audit Service
         Event Service
         Cache Repository
```

### Layers

- **Controllers**: Handle HTTP requests, validation, and response formatting
- **Services**: Implement business logic and orchestrate operations
- **Repositories**: Abstract data access to PostgreSQL and Redis
- **Middleware**: Context propagation, authentication, error handling

## API Endpoints

### Balance Retrieval
```
GET /api/v1/accounts/{accountId}/balance
Authorization: Bearer {JWT}
```

### Balance Update (Internal)
```
POST /api/v1/accounts/{accountId}/balance/update
x-service-token: {service-token}
```

### Health Checks
```
GET /health
GET /health/live
GET /health/ready
```

See [OpenAPI Specification](./swagger/accountbalance-openapi.yaml) for complete API documentation.

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- Redis 7
- Kafka (optional for local dev)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Database Setup

```bash
# Run migrations
npm run migrate:latest

# Rollback migrations (if needed)
npm run migrate:rollback
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
# Start all services (app, postgres, redis, kafka)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Configuration

All configuration is externalized via environment variables. See `.env.example` for available options.

### Key Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | HTTP server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_TTL` | Cache TTL in seconds | 30 |
| `JWT_SECRET` | JWT signing secret | (required) |
| `KAFKA_BROKERS` | Kafka broker list | localhost:9092 |

## Database Schema

### account_balances
```sql
account_id              CHAR(11) PRIMARY KEY
current_balance         DECIMAL(15,2)
credit_limit            DECIMAL(15,2)
cash_credit_limit       DECIMAL(15,2)
current_cycle_credit    DECIMAL(15,2)
current_cycle_debit     DECIMAL(15,2)
cycle_start_date        DATE
cycle_end_date          DATE
last_transaction_date   TIMESTAMPTZ
updated_at              TIMESTAMPTZ
version                 INTEGER
```

### balance_history
```sql
history_id              UUID PRIMARY KEY
account_id              CHAR(11) FK
transaction_id          CHAR(16)
previous_balance        DECIMAL(15,2)
new_balance             DECIMAL(15,2)
amount                  DECIMAL(15,2)
transaction_type        VARCHAR(20)
recorded_at             TIMESTAMPTZ
```

## Security

- **Authentication**: JWT tokens for public endpoints, service tokens for internal
- **Rate Limiting**: 1000 requests/minute per user
- **Data Masking**: Sensitive data masked in logs and audit trails
- **HTTPS**: TLS/SSL encryption in production
- **Input Validation**: Zod schema validation on all requests

## Monitoring

### Structured Logging

All logs include automatic trace ID propagation via AsyncLocalStorage:

```json
{
  "level": "info",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Balance updated",
  "accountId": "***8901",
  "timestamp": "2024-01-15T14:30:15Z"
}
```

### Health Endpoints

- `/health` - Basic service health
- `/health/live` - Liveness probe (always returns 200)
- `/health/ready` - Readiness probe (checks DB and Redis)

## Error Handling

All errors follow a standard format:

```json
{
  "errorCode": "CONFLICT",
  "message": "Insufficient credit. Available: $2549.25, Requested: $3000.00",
  "timestamp": "2024-01-15T14:30:15Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `404` - Account not found
- `409` - Insufficient credit
- `423` - Resource locked (includes Retry-After header)
- `500` - Internal server error

## Edge Cases

### Concurrent Updates
Database row-level locking ensures only one transaction updates balance at a time. Second transaction waits for lock release.

### Insufficient Credit
Debits exceeding available credit return 409 with current available amount.

### Cache Staleness
30-second TTL ensures cache staleness < 30s. Critical operations bypass cache.

### Lock Timeouts
5-second lock timeout with automatic rollback. Returns 423 with retry guidance.

## Development

### Code Standards

- TypeScript strict mode enabled
- No `any` types
- ESLint + Prettier enforced
- 100% module coverage required

### Testing Strategy

- **Unit Tests**: All services, repositories, utilities
- **Integration Tests**: Database transactions, Redis caching
- **Contract Tests**: API endpoint validation
- **Coverage**: ≥90% statements/branches, ≥95% lines/functions

### Project Structure

```
src/
├── config/           # Configuration and external connections
├── controllers/      # HTTP request handlers
├── middleware/       # Express middleware
├── repositories/     # Data access layer
├── services/         # Business logic
├── types/           # TypeScript types and DTOs
├── utils/           # Shared utilities
├── app.ts           # Express app setup
└── index.ts         # Application entry point

migrations/          # Database migrations
swagger/             # OpenAPI specification
__tests__/          # Test files
```

## Deployment

### Docker Build

```bash
docker build -t account-balance-service:latest .
```

### Kubernetes Deployment

The service includes health check endpoints for Kubernetes probes:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
```

### Environment-Specific Configuration

Use environment variables or ConfigMaps to configure per environment.

## Contributing

1. Follow TypeScript/Node.js coding standards
2. Maintain test coverage thresholds
3. Update OpenAPI spec for API changes
4. Add migration scripts for schema changes

## License

ISC
