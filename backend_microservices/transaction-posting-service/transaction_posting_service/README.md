# Transaction Posting Service

A production-ready TypeScript/Node.js service that posts validated transactions to account balances with full atomicity guarantees.

## Features

- ✅ Atomic transaction posting (all-or-nothing)
- ✅ Sequential transaction ID generation
- ✅ Real-time account balance updates
- ✅ Complete transaction history with merchant details
- ✅ Event publishing to Kafka for downstream processing
- ✅ Transaction reversal and adjustment support
- ✅ Concurrent transaction handling with database locks
- ✅ Comprehensive error handling and audit logging
- ✅ OpenAPI 3.0 specification
- ✅ Docker containerization
- ✅ Health check endpoints

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js migrations
- **Message Queue**: Kafka (KafkaJS)
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest with pg-mem and Testcontainers
- **Containerization**: Docker & Docker Compose

## Architecture

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests, validation, and response formatting
- **Services**: Contain business logic and orchestration
- **Repositories**: Data access layer with database operations
- **Middleware**: Authentication, logging, error handling, request context

## API Endpoints

### Transactions

- `POST /api/v1/transactions` - Post a validated transaction

### Health Checks

- `GET /health/ready` - Readiness probe (checks database connectivity)
- `GET /health/live` - Liveness probe
- `GET /v1/transaction-posting/health` - Service health and version

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15+
- Kafka (optional for local development)
- Docker & Docker Compose (for containerized setup)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations**:
   ```bash
   npm run migrate:up
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The service will start on `http://localhost:3000`

### Docker Setup

1. **Start all services** (PostgreSQL, Kafka, and the app):
   ```bash
   docker-compose up -d
   ```

2. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

3. **Stop services**:
   ```bash
   docker-compose down
   ```

## Database Schema

### Tables

- **accounts**: Account information, balances, and credit limits
- **cards**: Card to account mapping and status
- **validations**: Validation records from upstream service
- **transactions**: Complete transaction history

## Transaction Types

- `01` - Debit (Purchase)
- `02` - Credit (Payment)
- `03` - Debit (Cash Advance)
- `04` - Debit (Fee)
- `05` - Debit (Interest)
- `06` - Adjustment

## Testing

### Run all tests:
```bash
npm test
```

### Run tests with coverage:
```bash
npm run test:coverage
```

### Coverage thresholds:
- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

## Build

### Development build:
```bash
npm run build
```

### Production build:
```bash
npm run build
npm start
```

## API Documentation

OpenAPI specification is available at:
- Local: `swagger/transaction-posting-openapi.yaml`
- Import into Swagger UI or Postman for interactive documentation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `transaction_posting` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:9092` |
| `SERVICE_TOKEN` | Internal service authentication token | - |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTHORIZATION_MISMATCH` | 400 | Auth code doesn't match validation |
| `UNAUTHORIZED` | 401 | Invalid service token |
| `VALIDATION_NOT_FOUND` | 404 | Validation record not found |
| `DUPLICATE_TRANSACTION` | 409 | Transaction already posted |
| `ACCOUNT_INACTIVE` | 409 | Account is not active |
| `CARD_INACTIVE` | 409 | Card is not active |
| `AMOUNT_MISMATCH` | 422 | Amount doesn't match validation |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `TRANSACTION_ID_GENERATION_ERROR` | 500 | Failed to generate transaction ID |

## Edge Cases Handled

- Duplicate posting attempts
- Account status changes between validation and posting
- Balance update failures with full rollback
- Transaction ID collision detection
- Concurrent transactions on same account
- Negative balances (credit to customer)
- Kafka event publish failures (eventual consistency)

## Security

- Internal service token authentication
- Card number masking in logs and responses
- Sensitive data encryption
- Input validation with Zod
- SQL injection prevention with parameterized queries
- No HTTP objects in service/repository layers

## Monitoring & Observability

- Structured logging with Pino
- Automatic trace ID propagation via AsyncLocalStorage
- Audit logging for all operations
- Health check endpoints for orchestration
- Kafka event publishing for downstream analytics

## License

ISC
