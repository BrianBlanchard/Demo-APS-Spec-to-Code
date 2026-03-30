# Account Creation Service

Production-ready Node.js/TypeScript service for creating and managing customer accounts with KYC verification, credit limit initialization, and comprehensive audit trail.

## Features

- **Account Creation**: Create new accounts with KYC verification and credit limit validation
- **Business Rule Enforcement**: Cash advance limit ≤ credit limit (BR-009)
- **KYC Compliance**: Validates customer KYC status = VERIFIED (NFR-006)
- **Audit Trail**: Comprehensive logging of all account creation events
- **Health Checks**: Liveness and readiness probes for container orchestration
- **OpenAPI Specification**: Complete API documentation in Swagger/OpenAPI 3.0 format
- **Containerization**: Docker and Docker Compose support

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Testing**: Jest
- **Logging**: Pino (structured logging)
- **Validation**: Zod
- **API Documentation**: OpenAPI 3.0

## Architecture

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests, validation, and response construction
- **Services**: Pure business logic, no HTTP abstractions
- **Repositories**: Data access layer
- **Middleware**: Error handling, request context, logging
- **AsyncLocalStorage**: Automatic trace ID propagation

## Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+ (or use Docker Compose)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations**:
   ```bash
   psql -h localhost -U postgres -d account_service -f migrations/001_create_tables.sql
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access API**:
   - Base URL: http://localhost:3000/api/v1/accounts
   - Health: http://localhost:3000/health/ready

### Docker Compose

```bash
# Start all services (PostgreSQL + App)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## API Endpoints

### Account Creation

**POST** `/api/v1/accounts`

Create a new account for a verified customer.

**Request**:
```json
{
  "customerId": "CUS-2026-000123",
  "accountType": "STANDARD_CREDIT",
  "creditLimit": 5000.00,
  "cashAdvanceLimit": 1000.00,
  "disclosureGroupCode": "DG-STANDARD"
}
```

**Response** (201 Created):
```json
{
  "id": 98765,
  "accountId": "12345678901",
  "customerId": "CUS-2026-000123",
  "status": "NEW",
  "accountType": "STANDARD_CREDIT",
  "creditLimit": 5000.00,
  "cashAdvanceLimit": 1000.00,
  "currentBalance": 0.00,
  "availableCredit": 5000.00,
  "openingDate": "2026-03-16",
  "expirationDate": "2029-03-16",
  "disclosureGroupCode": "DG-STANDARD",
  "createdAt": "2026-03-16T11:00:00Z",
  "updatedAt": "2026-03-16T11:00:00Z"
}
```

### Health Checks

- **GET** `/health/live` - Liveness probe
- **GET** `/health/ready` - Readiness probe (includes DB check)

## Business Rules

- **BR-009**: Cash advance limit (ACSHLIM) must not exceed credit limit (ACRDLIM)
- **NFR-006**: Account creation requires customer KYC status = VERIFIED
- **NFR-001**: Response time < 500ms

## Error Handling

All errors follow a standard format:

```json
{
  "status": 400,
  "error": "ValidationError",
  "message": "Validation failed",
  "timestamp": "2026-03-16T11:00:00Z",
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "errors": [
    {
      "field": "cashAdvanceLimit",
      "message": "Cash advance limit cannot exceed credit limit (BR-009)"
    }
  ]
}
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Coverage Thresholds**:
- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%

## Build

```bash
# Compile TypeScript
npm run build

# Run production build
npm start
```

## Code Quality

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check
```

## Configuration

All configuration is externalized via environment variables. See `.env.example` for available options.

**Key configurations**:
- `PORT`: Server port (default: 3000)
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DEFAULT_ACCOUNT_TERM_MONTHS`: Default account term (default: 36)
- `REISSUANCE_WINDOW_DAYS`: Reissuance window (default: 60)

## Database Schema

- **customers**: Customer records with KYC status
- **disclosure_groups**: Interest rate disclosure groups
- **account_type_configs**: Account type configurations
- **accounts**: Account master records
- **account_balances**: Balance tracking (one-to-one with accounts)
- **audit_logs**: Comprehensive audit trail

## API Documentation

OpenAPI 3.0 specification available at:
- File: `swagger/account-creation-openapi.yaml`
- View in Swagger UI or Redoc

## License

ISC
