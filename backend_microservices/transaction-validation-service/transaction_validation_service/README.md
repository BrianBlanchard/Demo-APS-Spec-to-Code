# Transaction Validation Service

Real-time credit card transaction validation service that validates incoming transactions in under 500ms. The service performs comprehensive checks including card status verification, account status verification, credit availability checks, CVV validation, duplicate transaction detection, and daily transaction limits.

## Features

- **Real-time Validation**: Sub-500ms transaction validation
- **Comprehensive Checks**: Card status, account status, credit availability, CVV, duplicates
- **Fraud Detection**: Duplicate transaction detection and CVV failure tracking
- **High Performance**: Redis caching for frequently accessed data
- **Production Ready**: Structured logging, error handling, health checks
- **Containerized**: Docker support with multi-stage builds
- **Well Tested**: Comprehensive test coverage with unit and integration tests

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest
- **API Documentation**: OpenAPI 3.0

## Architecture

The service follows a clean layered architecture:

```
Controller → Service → Repository → Database
                ↓
           Cache Service
                ↓
            Audit Service
```

### Layers

- **Controllers**: Handle HTTP requests/responses, input validation
- **Services**: Contain business logic and orchestration
- **Repositories**: Data access layer for database operations
- **Cache Service**: Redis caching for performance optimization
- **Audit Service**: Structured audit logging for compliance

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- Redis 7
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment configuration:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Run database migrations:

```bash
npm run migrate:latest
```

6. Start the development server:

```bash
npm run dev
```

The service will be available at `http://localhost:3000`

## Docker Deployment

### Using Docker Compose (Recommended)

Start all services (application, PostgreSQL, Redis):

```bash
docker-compose up -d
```

Run migrations:

```bash
docker-compose exec app npm run migrate:latest
```

Stop services:

```bash
docker-compose down
```

### Building Docker Image

```bash
docker build -t transaction-validation-service .
```

## API Documentation

### Base URL

```
Local: http://localhost:3000
API Base Path: /api/v1
```

### Authentication

All API endpoints (except health checks) require API key authentication:

```
Header: X-API-Key: your-api-key
```

### Main Endpoints

#### Validate Transaction

```http
POST /api/v1/transactions/validate
```

**Request Body:**

```json
{
  "cardNumber": "4532123456781234",
  "transactionType": "01",
  "transactionCategory": "5411",
  "amount": 125.50,
  "merchantId": "MERCH12345",
  "merchantName": "AMAZON.COM",
  "merchantCity": "Seattle",
  "merchantZip": "98101",
  "transactionTimestamp": "2024-01-15T14:30:00Z",
  "transactionSource": "POS",
  "cvv": "123"
}
```

**Success Response (Approved):**

```json
{
  "validationId": "VAL-20240115-ABC123",
  "validationResult": "approved",
  "cardNumber": "************1234",
  "accountId": "12345678901",
  "amount": 125.50,
  "availableCredit": 2549.25,
  "remainingCreditAfter": 2423.75,
  "authorizationCode": "AUTH789456",
  "timestamp": "2024-01-15T14:30:00.234Z",
  "validationChecks": [
    {"check": "card_active", "result": "pass"},
    {"check": "account_active", "result": "pass"},
    {"check": "sufficient_credit", "result": "pass"}
  ]
}
```

**Success Response (Declined):**

```json
{
  "validationId": "VAL-20240115-XYZ789",
  "validationResult": "declined",
  "declineReason": "insufficient_credit",
  "declineReasonDescription": "Transaction amount exceeds available credit",
  "cardNumber": "************1234",
  "amount": 3000.00,
  "availableCredit": 2549.25,
  "timestamp": "2024-01-15T14:30:00.234Z",
  "validationChecks": [
    {"check": "sufficient_credit", "result": "fail", "details": "Required: 3000.00, Available: 2549.25"}
  ]
}
```

### Health Endpoints

#### Readiness Probe

```http
GET /health/ready
```

#### Liveness Probe

```http
GET /health/live
```

#### Service Health

```http
GET /api/v1/transaction-validation/health
```

## Validation Rules

### Card Validation

- **Luhn Check**: Card number must pass Luhn algorithm validation
- **Status Check**: Card must be in 'active' status
- **Expiration**: Transaction date must be before card expiration
- **CVV**: Required for online transactions, validated against stored CVV

### Account Validation

- **Status Check**: Account must be in 'active' status
- **Credit Check**: Available credit must be sufficient for transaction amount
- **Cash Advance**: Separate limit for cash advance transactions

### Transaction Validation

- **Duplicate Detection**: Prevents duplicate transactions (same card, merchant, amount within 2 minutes)
- **Daily Limits**: Enforces per-card daily transaction count limits
- **Amount Limits**: Validates transaction amount ranges
- **Type Validation**: Ensures valid transaction type codes (01-06)

### Decline Reasons

- `insufficient_credit`: Available credit too low
- `card_inactive`: Card is suspended or cancelled
- `account_inactive`: Account is closed or suspended
- `invalid_cvv`: CVV does not match
- `duplicate_transaction`: Possible duplicate detected
- `daily_limit_exceeded`: Daily transaction limit reached
- `invalid_card`: Card number invalid or not found
- `expired_card`: Card past expiration date

## Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Testing
npm test             # Run all tests
npm run test:coverage # Run tests with coverage report
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Lint code
npm run lint:fix     # Lint and fix code
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Database
npm run migrate:latest   # Run latest migrations
npm run migrate:rollback # Rollback last migration
```

## Configuration

All configuration is managed through environment variables. See `.env.example` for available options.

### Key Configuration Options

- `PORT`: Server port (default: 3000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection
- `REDIS_HOST`, `REDIS_PORT`: Redis connection
- `VALIDATION_TIMEOUT_MS`: Maximum validation time (default: 1000ms)
- `DUPLICATE_TRANSACTION_WINDOW_SECONDS`: Duplicate detection window (default: 120s)
- `CVV_MAX_FAILURES`: Max CVV failures before card suspension (default: 3)

## Testing

The service includes comprehensive test coverage:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **Contract Tests**: Validate API contracts

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Functions: ≥95%
- Lines: ≥95%

## OpenAPI Specification

The complete API specification is available at:

```
./swagger/transaction-validation-openapi.yaml
```

View in Swagger UI or import into Postman for interactive API documentation.

## Logging

The service uses structured JSON logging with automatic trace ID propagation:

```json
{
  "level": "info",
  "time": "2024-01-15T14:30:00.234Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "event": "validation_response",
  "validationId": "VAL-20240115-ABC123",
  "result": "approved"
}
```

All sensitive data (card numbers, CVV) is automatically masked in logs.

## Performance

- **Target Response Time**: < 500ms (99th percentile)
- **Timeout**: 1 second (hard limit)
- **Rate Limit**: 10,000 requests/minute
- **Cache TTL**: 5 minutes (configurable)

## Security

- **API Key Authentication**: Required for all business endpoints
- **Data Masking**: Card numbers masked in responses and logs
- **Encryption**: Sensitive data encrypted at rest
- **TLS/SSL**: All production traffic encrypted in transit
- **Input Validation**: Comprehensive request validation with Zod
- **Rate Limiting**: Prevents abuse and DDoS attacks

## Monitoring & Observability

- **Structured Logging**: JSON logs with trace IDs
- **Health Checks**: Kubernetes-compatible readiness/liveness probes
- **Audit Trail**: All validation decisions logged
- **Performance Metrics**: Response times tracked and logged

## License

ISC

## Support

For issues and questions, please contact the development team.
