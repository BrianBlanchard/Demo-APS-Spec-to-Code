# Card Issuance Service

A production-ready Node.js/TypeScript microservice for issuing payment cards with PCI-DSS compliant encryption.

## Features

- **PCI-DSS Compliant**: AES-256 GCM encryption for Primary Account Numbers (PAN)
- **Luhn Validation**: Validates card numbers using Luhn checksum algorithm
- **Account Validation**: Ensures cards are only issued for active accounts
- **Audit Logging**: Comprehensive PCI audit trail with automatic trace ID capture
- **Rate Limiting**: 20 requests per minute per user
- **JWT Authentication**: Bearer token authentication with role-based access control
- **Health Checks**: Kubernetes-ready readiness and liveness probes
- **Containerized**: Docker and Docker Compose support

## Technology Stack

- **Language**: TypeScript 5.x (strict mode)
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Testing**: Jest with 90%+ coverage thresholds
- **Validation**: Zod schema validation
- **Logging**: Pino structured logging with AsyncLocalStorage context

## Architecture

```
Controller → Service → Repository → Database
     ↓          ↓
  Middleware  Services (Encryption, Audit)
```

**Layers:**
- **Controllers**: Handle HTTP requests/responses, validation
- **Services**: Business logic, orchestration
- **Repositories**: Data access layer
- **Middleware**: Authentication, rate limiting, error handling, context propagation

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env and set required values:
# - ENCRYPTION_KEY (base64-encoded 256-bit key)
# - DB credentials
# - JWT_SECRET
```

### Generate Encryption Key

```bash
# Generate a secure 256-bit key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add the generated key to `.env`:
```
ENCRYPTION_KEY=your-generated-base64-key-here
```

### Database Setup

```bash
# Run migrations
npm run migrate:up
```

This will create:
- `accounts` table with sample test accounts
- `cards` table with proper indexes and constraints

### Running the Application

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

**Docker Compose:**
```bash
docker-compose up -d
```

## API Endpoints

### Health Checks

- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe (includes DB health)

### Card Issuance

**POST /api/v1/cards**

Issues a new payment card.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "cardNumber": "4532015112830366",
  "accountId": "12345678901",
  "embossedName": "JOHN SMITH",
  "expirationYears": 3
}
```

**Response (201 Created):**
```json
{
  "id": 5001,
  "cardNumber": "****-****-****-0366",
  "lastFourDigits": "0366",
  "accountId": "12345678901",
  "status": "Issued",
  "expirationDate": "2029-03-31",
  "embossedName": "JOHN SMITH",
  "createdAt": "2026-03-13T18:00:00Z",
  "updatedAt": "2026-03-13T18:00:00Z"
}
```

## Validation Rules

- **Card Number**: Exactly 16 digits, must pass Luhn checksum
- **Account ID**: Exactly 11 digits, must reference existing active account
- **Embossed Name**: Max 26 characters, A-Z, 0-9, space, hyphen only
- **Expiration Years**: 1-5 years, default 3

## Error Codes

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing/invalid JWT token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Account does not exist |
| 409 | CONFLICT | Card number already exists |
| 422 | UNPROCESSABLE_ENTITY | Account not in Active status |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 503 | SERVICE_UNAVAILABLE | Encryption service down |

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

**Coverage Thresholds:**
- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

## Security Features

### PCI-DSS Compliance

- **Encryption**: AES-256 GCM mode for PAN storage
- **Key Management**: External key management service support
- **Masking**: Only last 4 digits visible in responses and logs
- **Audit Trail**: Comprehensive logging of card operations
- **Access Control**: Role-based authentication (Operator+ required)

### Additional Security

- **Rate Limiting**: Prevents brute force attacks
- **Input Sanitization**: Validates all inputs
- **Context Isolation**: AsyncLocalStorage for request context
- **Graceful Shutdown**: Proper cleanup on termination signals

## Docker Deployment

### Build Image

```bash
docker build -t card-issuance-service:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

Services:
- **app**: Card Issuance Service (port 3000)
- **postgres**: PostgreSQL database (port 5432)

### Environment Variables

See `.env.example` for all configuration options.

## OpenAPI Specification

API documentation available in Swagger format:
```
swagger/card-issuance-openapi.yaml
```

View in Swagger UI:
```bash
# Install Swagger UI (if not already installed)
npm install -g swagger-ui-express

# Serve the spec
npx swagger-ui-serve swagger/card-issuance-openapi.yaml
```

## Monitoring & Observability

### Structured Logging

All logs include:
- `traceId`: Unique request identifier (auto-captured via AsyncLocalStorage)
- `timestamp`: ISO 8601 timestamp
- `level`: Log level (info, warn, error)

### Audit Logging

PCI audit entries include:
- Entity type and ID
- Action performed
- User ID and IP address
- Trace ID for correlation

### Health Checks

- **/health/live**: Returns 200 if service is running
- **/health/ready**: Returns 200 if service and database are healthy

## Development Guidelines

- **TypeScript Strict Mode**: Enabled
- **No `any` Types**: Use explicit types
- **Dependency Injection**: Interface-based for testability
- **Error Handling**: Centralized middleware
- **No HTTP Leakage**: Request/Response stay in controllers
- **Context Propagation**: Use AsyncLocalStorage

## Project Structure

```
card_issuance_service/
├── src/
│   ├── controllers/       # HTTP request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access
│   ├── dto/              # Request/response DTOs
│   ├── entities/         # Database entities
│   ├── middleware/       # Express middleware
│   ├── types/            # Type definitions
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration
│   ├── database/         # Database connection
│   ├── context/          # AsyncLocalStorage context
│   └── app.ts            # Application entry point
├── migrations/           # Database migrations
├── __tests__/           # Test files
├── swagger/             # OpenAPI specification
├── Dockerfile           # Container definition
├── docker-compose.yml   # Multi-container setup
└── package.json         # Dependencies and scripts
```

## License

ISC

## Support

For issues or questions, contact: support@example.com
