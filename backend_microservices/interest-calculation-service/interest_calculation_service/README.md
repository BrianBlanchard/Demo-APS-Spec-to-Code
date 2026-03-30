# Interest Calculation Service

Legacy interest calculation service implementing the exact CBACT04C mainframe formula for credit card interest calculations.

## Overview

This service calculates monthly interest charges using the legacy formula: `interest = (balance × rate) / 1200` with HALF_UP rounding to the nearest cent. It applies minimum charge rules, handles edge cases for zero and credit balances, and performs separate calculations for purchase and cash advance balances.

### Key Features

- **Exact Formula Parity**: Implements CBACT04C mainframe formula with BigDecimal precision
- **HALF_UP Rounding**: Consistent rounding to 2 decimal places matching legacy system
- **Minimum Charge Rule**: $0.50 minimum charge for small balances per BR-003
- **Dual Balance Types**: Separate calculations for purchase and cash advance balances
- **Audit Trail**: Complete calculation breakdown and audit logging
- **High Performance**: Sub-500ms response time per NFR-001
- **Production Ready**: Comprehensive error handling, logging, and monitoring

## Technology Stack

- **Language**: TypeScript 5.x (strict mode)
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Testing**: Jest
- **Logging**: Pino (structured logging)
- **Containerization**: Docker & Docker Compose

## Architecture

```
Controller/Router → Service → Repository → Database
                   ↓
              Audit Service
```

- **Controllers**: Handle HTTP requests/responses, input validation
- **Services**: Pure business logic, interest calculation
- **Repositories**: Database access, external service clients
- **Middleware**: Context propagation, error handling, logging

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- npm or pnpm
- Docker & Docker Compose (for containerized deployment)

## Installation

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**:
   ```bash
   # Start PostgreSQL (or use Docker Compose)
   docker run -d --name postgres \
     -e POSTGRES_DB=interest_calculation \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     postgres:16-alpine

   # Run migrations
   npm run migrate:up
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The service will be available at `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

2. **Check service health**:
   ```bash
   curl http://localhost:3000/health/ready
   ```

## API Documentation

### Calculate Interest

**Endpoint**: `POST /api/v1/accounts/{accountId}/interest/calculate`

**Request**:
```json
{
  "calculationDate": "2026-03-16",
  "applyToAccount": false
}
```

**Response**:
```json
{
  "accountId": "12345678901",
  "calculationDate": "2026-03-16",
  "purchaseBalance": "2500.00",
  "purchaseRate": "18.990",
  "purchaseInterest": "39.56",
  "purchaseInterestCalculation": "(2500.00 × 18.990) / 1200 = 39.5625 → 39.56 (HALF_UP)",
  "cashAdvanceBalance": "500.00",
  "cashAdvanceRate": "24.990",
  "cashAdvanceInterest": "10.41",
  "cashAdvanceInterestCalculation": "(500.00 × 24.990) / 1200 = 10.4125 → 10.41 (HALF_UP)",
  "totalInterest": "49.97",
  "minimumChargeApplied": false,
  "appliedToAccount": false,
  "calculatedAt": "2026-03-16T11:00:00Z",
  "calculatedBy": "operator-123"
}
```

### Health Checks

- **Readiness**: `GET /health/ready` - Database connectivity check
- **Liveness**: `GET /health/live` - Process health check
- **Service Health**: `GET /v1/interest-calculation/health` - Alternative health endpoint

### OpenAPI Specification

Full API documentation is available in Swagger format:

```bash
# View the spec
cat swagger/interest-calculation-openapi.yaml

# Or serve with Swagger UI (install swagger-ui-dist)
npx serve swagger
```

## Database Schema

### Tables

1. **accounts**
   - `id`: Primary key (bigint)
   - `account_id`: 11-digit account identifier (unique)
   - `status`: ACTIVE | SUSPENDED | CLOSED
   - `disclosure_group_id`: FK to disclosure groups
   - Timestamps

2. **account_balances**
   - `id`: Primary key (bigint)
   - `account_id`: FK to accounts
   - `current_balance`: Total balance (decimal 15,2)
   - `purchase_balance`: Purchase balance
   - `cash_advance_balance`: Cash advance balance
   - `last_interest_amount`: Last calculated interest
   - `last_interest_date`: Last calculation date
   - `version`: Optimistic lock version
   - `updated_at`: Update timestamp

3. **interest_calculations** (Audit Table)
   - Full calculation details and audit trail
   - Purchase and cash advance breakdowns
   - Minimum charge flags
   - Calculated by/at timestamps

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage
```

### Linting & Formatting

```bash
# Lint
npm run lint

# Format
npm run format
```

### Database Migrations

```bash
# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down

# Create new migration
npm run migrate:make migration_name
```

## Business Rules

### Interest Calculation Formula

```
interest = (balance × rate) / 1200

Where:
- balance: Outstanding balance (DECIMAL with 2 decimal places)
- rate: Annual percentage rate (e.g., 18.990 for 18.99%)
- 1200: Constant (12 months × 100 to convert percentage)
- Rounding: HALF_UP to 2 decimal places
```

### Minimum Charge Rule (BR-003)

```
IF balance > 0 AND calculated_interest > 0 AND calculated_interest < 0.50:
    interest = 0.50
ELSE IF balance <= 0:
    interest = 0.00
ELSE:
    interest = calculated_interest (rounded)
```

### Edge Cases

- **Zero Balance**: Returns $0.00 (no minimum charge)
- **Credit Balance**: Negative balance returns $0.00
- **Tiny Balance**: If calculated $0.00 < x < $0.50, applies $0.50 minimum
- **Large Balance**: BigDecimal prevents overflow
- **HALF_UP Rounding**: $10.125 rounds to $10.13
- **Missing Rate**: Returns 422 Unprocessable Entity
- **Separate Calculations**: Purchase and cash advance calculated independently

## Configuration

All configuration is externalized via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | HTTP server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | interest_calculation |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_POOL_MIN` | Connection pool min | 2 |
| `DB_POOL_MAX` | Connection pool max | 10 |
| `LOG_LEVEL` | Logging level (info/debug/warn/error) | info |
| `CORS_ALLOW_ORIGIN` | CORS allowed origins | * |
| `INTEREST_RATE_SERVICE_URL` | External rate service URL | http://localhost:3001 |

## Monitoring & Logging

### Structured Logging

The service uses Pino for structured JSON logging with automatic trace ID propagation via AsyncLocalStorage.

All logs include:
- `level`: Log level
- `traceId`: Request correlation ID (auto-generated)
- `userId`: User identifier (from JWT)
- `timestamp`: ISO 8601 timestamp
- `msg`: Log message
- Additional context fields

### Audit Logging

All interest applications to accounts are audited with:
- Action type (UPDATE)
- Entity type and ID (masked account ID)
- Old and new values
- Additional context (interest amount, calculation date)
- Automatic trace ID correlation

### Health Checks

- `/health/ready`: Database connectivity (for Kubernetes readiness probe)
- `/health/live`: Process liveness (for Kubernetes liveness probe)
- Both endpoints return JSON with service status and version

## Error Handling

All errors follow a standard format:

```json
{
  "status": 422,
  "error": "UNPROCESSABLE_ENTITY",
  "message": "Account has no disclosure group assignment",
  "timestamp": "2026-03-16T11:00:00Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Cannot calculate interest without interest rate assignment"
}
```

### Error Codes

- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid JWT)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (account does not exist)
- `422`: Unprocessable Entity (business rule violation)
- `500`: Internal Server Error (unexpected error)
- `503`: Service Unavailable (external dependency failure)

## Testing Strategy

### Test Layers

1. **Unit Tests**: DTOs, entities, utilities, calculators
2. **Integration Tests**: Service layer, repository layer, database interactions
3. **Contract Tests**: API endpoints, request/response validation
4. **E2E Tests**: Full workflow with Testcontainers

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

### Running Tests

```bash
# All tests
npm test

# With coverage report
npm run test:coverage

# Watch mode
npm test -- --watch
```

## Deployment

### Container Build

```bash
# Build image
docker build -t interest-calculation-service:latest .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=secure_password \
  interest-calculation-service:latest
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Kubernetes

Health check endpoints are designed for Kubernetes probes:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

## Performance

- **Response Time**: < 500ms per calculation (NFR-001)
- **Database Pool**: Configurable (default 2-10 connections)
- **Graceful Shutdown**: 10-second timeout for in-flight requests
- **Health Checks**: 30-second interval, 3-second timeout

## Security

- **Authentication**: Bearer JWT tokens required
- **Authorization**: Role-based (Operator+ for manual, service account for batch)
- **Rate Limiting**: 100 requests/minute
- **Input Validation**: Zod schema validation
- **Data Masking**: Account IDs masked in logs (show last 4 digits only)
- **SQL Injection**: Parameterized queries via Knex.js
- **CORS**: Configurable allowed origins
- **Non-root User**: Docker container runs as non-root user

## Troubleshooting

### Database Connection Issues

```bash
# Test database connectivity
docker exec -it interest-calc-db psql -U postgres -d interest_calculation -c "SELECT 1"

# Check logs
docker-compose logs postgres
```

### Migration Issues

```bash
# Check migration status
npx knex migrate:status

# Rollback and retry
npm run migrate:down
npm run migrate:up
```

### Application Logs

```bash
# View logs (Docker)
docker-compose logs -f app

# View logs (local)
npm run dev  # Logs to stdout with pretty printing
```

## License

ISC

## Support

For issues or questions, please contact the development team or open an issue in the repository.
