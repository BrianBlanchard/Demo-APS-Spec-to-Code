# Account Status Management Service

A production-ready microservice for managing credit card account status transitions with comprehensive validation, audit logging, and event publishing.

## Features

- **Status Transitions**: Manage account lifecycle (active, suspended, inactive)
- **Validation**: Enforce business rules for status transitions
- **Audit Logging**: Comprehensive logging with automatic traceId propagation
- **Cascading Updates**: Automatically update associated card statuses
- **Event Publishing**: Kafka event publishing for downstream systems
- **Concurrency Control**: Optimistic locking to prevent race conditions
- **Rate Limiting**: 100 requests/minute per user
- **Health Checks**: Kubernetes-ready readiness and liveness probes
- **OpenAPI Documentation**: Complete API specification

## Technology Stack

- **Language**: TypeScript 5.x with strict mode
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Event Streaming**: Kafka
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## Architecture

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Manage data access
- **Middleware**: Cross-cutting concerns (auth, logging, validation)

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- Kafka (optional for local development)
- Docker & Docker Compose (for containerized deployment)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration

### Database Setup

Run migrations:

```bash
npm run migrate:latest
```

### Development

Start the development server:

```bash
npm run dev
```

The service will be available at `http://localhost:3000`

### Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Docker Deployment

### Using Docker Compose

Start all services (app, database, Kafka):

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

### Using Docker Only

Build the image:

```bash
docker build -t account-status-service .
```

Run the container:

```bash
docker run -p 3000:3000 --env-file .env account-status-service
```

## API Documentation

The complete OpenAPI 3.0 specification is available at:

```
swagger/account-status-openapi.yaml
```

### Main Endpoint

**PUT /api/v1/accounts/{accountId}/status**

Update account status with validation and cascading effects.

**Request:**
```json
{
  "newStatus": "suspended",
  "reason": "fraud_investigation",
  "notes": "Suspicious transactions detected",
  "notifyCustomer": true
}
```

**Response:**
```json
{
  "accountId": "12345678901",
  "previousStatus": "active",
  "newStatus": "suspended",
  "reason": "fraud_investigation",
  "effectiveDate": "2024-01-15T14:30:00Z",
  "updatedBy": "ADMIN001",
  "cascadedCards": [
    {
      "cardNumber": "************1234",
      "previousStatus": "active",
      "newStatus": "suspended"
    }
  ],
  "notificationSent": true
}
```

### Health Endpoints

- **GET /health/ready**: Readiness probe (checks database)
- **GET /health/live**: Liveness probe

## Authentication

All API endpoints require JWT authentication with ADMIN role.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**JWT Payload:**
```json
{
  "userId": "ADMIN001",
  "role": "ADMIN"
}
```

## Testing

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | account_status_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `JWT_SECRET` | JWT signing secret | (required) |
| `KAFKA_BROKERS` | Kafka broker URLs | localhost:9092 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 60000 |

## Business Rules

### Valid Status Transitions

- **active → suspended**: ✓ Allowed
- **active → inactive**: ✓ Allowed
- **suspended → active**: ✓ Allowed (reactivation)
- **suspended → inactive**: ✓ Allowed
- **inactive → active**: ✗ Not allowed (closed accounts cannot reopen)
- **inactive → suspended**: ✗ Not allowed

### Status Change Reasons

- `fraud_investigation`: Suspected fraud
- `customer_request`: Customer requested closure
- `delinquent_account`: Payment delinquency
- `account_upgrade`: Upgrading to new account
- `regulatory_compliance`: Compliance requirement
- `system_maintenance`: System maintenance

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ACCOUNT_NOT_FOUND` | 404 | Account does not exist |
| `INVALID_STATUS_TRANSITION` | 422 | Transition not allowed |
| `CONCURRENT_MODIFICATION` | 409 | Account modified by another user |
| `UNAUTHORIZED` | 401 | Invalid or missing JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error |

## Monitoring

### Logging

The service uses structured logging with automatic traceId propagation via AsyncLocalStorage.

**Log Format:**
```json
{
  "level": "info",
  "msg": "Account status change audit",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "ADMIN001",
  "accountId": "***********",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### Sensitive Data Masking

The following fields are automatically masked in logs:
- Account IDs
- Card numbers
- Balance information

## Development Guidelines

- Follow TypeScript strict mode conventions
- Use explicit type annotations
- Avoid `any` type
- No Request/Response objects in service/repository layers
- Use AsyncLocalStorage for request context
- Implement dependency injection for testability
- Write tests for all business logic

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Ensure coverage thresholds are met
4. Update OpenAPI specification for API changes
5. Run linting and formatting before committing

## License

MIT
