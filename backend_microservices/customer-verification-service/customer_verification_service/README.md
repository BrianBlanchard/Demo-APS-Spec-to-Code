# Customer Identity Verification Service

Automated identity verification and fraud detection service for customer onboarding and profile updates. Integrates with external credit bureaus, government ID verification services, and fraud detection systems to ensure customer authenticity and compliance with KYC (Know Your Customer) regulations.

## Features

- ✅ **Multi-source Identity Verification**: Credit bureau, government ID, fraud detection, address verification
- ✅ **Asynchronous Processing**: Non-blocking verification with real-time status tracking
- ✅ **KYC Compliance**: Automated compliance with Know Your Customer regulations
- ✅ **Fraud Detection**: Pattern analysis and risk scoring
- ✅ **Audit Logging**: Complete audit trail with structured logging
- ✅ **Retry with Backoff**: Resilient external service integration
- ✅ **Manual Review Workflow**: Automatic escalation for edge cases
- ✅ **Production Ready**: Full containerization, health checks, graceful shutdown

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Validation**: Zod
- **Logging**: Pino with AsyncLocalStorage
- **Testing**: Jest with coverage thresholds
- **Containerization**: Docker with multi-stage builds

## Architecture

```
Controller → Service → Repository → Database
     ↓           ↓
Validation   External Services
     ↓           ↓
  Error     Audit Logging
 Handler
```

### Layered Architecture

- **Controllers**: Handle HTTP requests/responses, input validation
- **Services**: Pure business logic, orchestration
- **Repositories**: Database operations
- **External Clients**: Third-party API integrations
- **Middleware**: Request context, error handling, logging

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16 or higher
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd customer_verification_service

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure environment variables in .env
```

### Database Setup

```bash
# Run migrations
npm run migrate:latest

# Rollback migrations (if needed)
npm run migrate:rollback
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

#### Docker Compose

```bash
# Start all services
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

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## API Documentation

OpenAPI 3.0 specification available at: `swagger/customer-verification-openapi.yaml`

### Key Endpoints

#### Verification

- **POST** `/api/v1/verification/identity` - Initiate identity verification
- **GET** `/api/v1/verification/identity/{verificationId}` - Get verification status

#### Health Checks

- **GET** `/health/ready` - Readiness probe (includes DB check)
- **GET** `/health/live` - Liveness probe
- **GET** `/api/v1/customer-verification/health` - General health status

## Configuration

All configuration is externalized via environment variables. See `.env.example` for complete list.

### Key Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `customer_verification` |
| `MAX_RETRY_ATTEMPTS` | External service retry attempts | `3` |
| `FRAUD_RISK_HIGH_THRESHOLD` | High fraud risk threshold | `70` |
| `FICO_SCORE_MIN_THRESHOLD` | Minimum FICO score | `550` |

## Verification Flow

### Phase 1: Initiate Verification

1. Client sends POST request with customer data
2. Service validates input and creates verification record
3. Service returns verification ID immediately
4. Service queues asynchronous verification tasks

### Phase 2: Asynchronous Processing

1. Credit bureau check (FICO score validation)
2. Government ID verification
3. Fraud detection analysis
4. Address verification

All checks run in parallel with retry logic and exponential backoff.

### Phase 3: Status Polling

Client polls GET endpoint to check verification status until completion.

### Edge Case Handling

- **Credit bureau unavailable**: 3 retries with backoff, manual review if failed
- **Name mismatch**: Automatic failure, fraud team notification
- **High fraud risk (score > 70)**: Account suspension, fraud investigation
- **Partial success**: Manual review with reduced privileges
- **SSN duplicate**: Immediate failure, security alert
- **Expired ID**: Document update required
- **Low FICO score**: Declined with notification

## Database Schema

### Tables

- `verification_records`: Main verification tracking
- `verification_checks`: Individual check results
- `customers`: Customer information (simplified)

## Audit Logging

All verification events are logged with:
- Structured format (JSON)
- Automatic trace ID correlation
- Sensitive data masking
- Timestamp and event type
- Detailed context

## Error Handling

Centralized error handling with standard error response format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Invalid SSN format",
  "timestamp": "2024-01-15T10:30:00Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Testing Coverage Thresholds

- Statements: ≥ 90%
- Branches: ≥ 90%
- Lines: ≥ 95%
- Functions: ≥ 95%
- Modules: 100%

## Security

- JWT Bearer token authentication for internal services
- Rate limiting: 1000 requests/minute
- Input validation with Zod schemas
- Sensitive data masking in logs and responses
- SQL injection protection via parameterized queries
- HTTPS/TLS in production

## Monitoring & Observability

- Health check endpoints for Kubernetes/Docker
- Structured logging with trace ID correlation
- Request context propagation via AsyncLocalStorage
- Graceful shutdown handling

## Development Guidelines

- TypeScript strict mode enabled
- No `any` types
- Named exports preferred
- Async/await (no callbacks)
- Dependency injection for testability
- No Request/Response objects in service layer
- Centralized error handling (no try-catch in services)

## License

ISC

## Support

For issues or questions, contact: support@example.com
