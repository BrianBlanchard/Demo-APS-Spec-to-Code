# Card Lookup Service

A secure, production-ready card information retrieval service with role-based masking, built with TypeScript and Node.js.

## Features

- 🔒 **Role-Based Masking**: Automatic card number masking based on user role (Customer, CSR, Admin)
- ⚡ **High Performance**: Redis caching with 2-minute TTL for frequently accessed cards
- 🔍 **Comprehensive Lookup**: Support for card, account, customer, and transaction data
- 📊 **Audit Logging**: Detailed audit trail for all card access attempts
- 🐳 **Containerized**: Docker and Docker Compose support for easy deployment
- 🧪 **Well Tested**: Comprehensive test suite with >90% coverage
- 📝 **OpenAPI Spec**: Complete OpenAPI 3.0+ specification for API documentation

## Technology Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Migrations**: Knex.js
- **Logging**: Pino (structured logging)
- **Testing**: Jest
- **Validation**: Zod
- **Containerization**: Docker

## Architecture

The application follows a clean layered architecture:

```
Controller → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses, validation
- **Services**: Contain business logic (masking, permissions, audit)
- **Repositories**: Database access layer
- **Middleware**: Authentication, tracing, error handling

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for containerized deployment)

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

3. **Start PostgreSQL and Redis** (if not using Docker):
   ```bash
   # PostgreSQL
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine

   # Redis
   docker run --name redis -p 6379:6379 -d redis:7-alpine
   ```

4. **Run database migrations**:
   ```bash
   npm run migrate:latest
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The service will be available at `http://localhost:3000`.

### Docker Deployment

1. **Build and start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Run migrations** (first time only):
   ```bash
   docker-compose exec app npx knex migrate:latest
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## API Documentation

### Endpoints

#### Card Lookup
```
GET /api/v1/cards/{cardNumber}
```

**Query Parameters**:
- `includeAccount` (boolean): Include account details
- `includeCustomer` (boolean): Include customer details
- `includeTransactions` (boolean): Include recent transactions

**Headers**:
- `Authorization`: Bearer JWT token (required)
- `x-user-id`: User ID making the request (required)
- `x-user-role`: User role - `customer`, `csr`, or `admin` (required)
- `x-trace-id`: Trace ID for request tracking (optional)

**Response**: Card details with role-based masking

#### Health Checks
```
GET /health           # Basic health check
GET /health/ready     # Readiness probe (checks DB & Redis)
GET /health/live      # Liveness probe
```

### Role-Based Masking

| Role     | Visible Digits | Example              |
|----------|---------------|----------------------|
| Customer | Last 4        | `************1234`   |
| CSR      | Last 6        | `**********781234`   |
| Admin    | Full number   | `4532123456781234`   |

### Example Request

```bash
curl -X GET 'http://localhost:3000/api/v1/cards/4532123456781234?includeAccount=true' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'x-user-id: 123456789' \
  -H 'x-user-role: customer'
```

### Example Response

```json
{
  "cardNumber": "************1234",
  "accountId": "12345678901",
  "customerId": "123456789",
  "embossedName": "JOHN M ANDERSON",
  "status": "active",
  "expirationDate": "01/27",
  "issuedDate": "2024-01-15",
  "account": {
    "accountId": "12345678901",
    "status": "active",
    "currentBalance": 2450.75,
    "creditLimit": 5000.00,
    "availableCredit": 2549.25
  }
}
```

## OpenAPI Specification

The complete OpenAPI 3.0+ specification is available at:
```
swagger/card-lookup-openapi.yaml
```

You can view it in Swagger UI or Redoc by importing the YAML file.

## Scripts

| Command              | Description                                    |
|---------------------|------------------------------------------------|
| `npm run dev`       | Start development server with auto-reload      |
| `npm run build`     | Build TypeScript to JavaScript                 |
| `npm start`         | Start production server                        |
| `npm test`          | Run tests                                      |
| `npm run test:coverage` | Run tests with coverage report             |
| `npm run lint`      | Lint code with ESLint                          |
| `npm run lint:fix`  | Fix linting issues automatically               |
| `npm run format`    | Format code with Prettier                      |
| `npm run migrate:latest` | Run database migrations                   |
| `npm run migrate:rollback` | Rollback last migration                |

## Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

**Coverage Targets**:
- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

## Project Structure

```
card_lookup_service/
├── src/
│   ├── controllers/         # HTTP request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── middleware/         # Express middleware
│   ├── entities/           # Domain entities
│   ├── dtos/              # Data transfer objects
│   ├── types/             # TypeScript types
│   ├── exceptions/        # Custom exceptions
│   ├── infrastructure/    # Infrastructure (DB, cache, logger, config)
│   ├── routes/            # Route definitions
│   ├── app.ts             # Express app setup
│   └── index.ts           # Application entry point
├── migrations/            # Database migrations
├── swagger/              # OpenAPI specification
├── __tests__/            # Test files
├── package.json
├── tsconfig.json
├── jest.config.js
├── knexfile.ts
├── Dockerfile
└── docker-compose.yml
```

## Environment Variables

| Variable              | Description                      | Default       |
|----------------------|----------------------------------|---------------|
| `NODE_ENV`           | Environment (development/production) | development |
| `PORT`               | Server port                      | 3000          |
| `LOG_LEVEL`          | Logging level                    | info          |
| `DB_HOST`            | PostgreSQL host                  | localhost     |
| `DB_PORT`            | PostgreSQL port                  | 5432          |
| `DB_NAME`            | Database name                    | card_lookup_db |
| `DB_USER`            | Database user                    | postgres      |
| `DB_PASSWORD`        | Database password                | postgres      |
| `REDIS_HOST`         | Redis host                       | localhost     |
| `REDIS_PORT`         | Redis port                       | 6379          |
| `CACHE_TTL_SECONDS`  | Cache TTL in seconds             | 120           |
| `API_TIMEOUT_MS`     | API timeout in milliseconds      | 3000          |
| `RATE_LIMIT_REQUESTS`| Rate limit requests per window   | 500           |
| `RATE_LIMIT_WINDOW_MS`| Rate limit window in ms         | 60000         |

## Security Features

- 🔐 JWT authentication required for all card endpoints
- 🛡️ Role-based access control (RBAC)
- 🔒 Automatic card number masking based on user role
- 📝 Comprehensive audit logging for all card access
- 🚨 Security alerts for admin full card number access
- 🔍 Trace ID propagation for request tracking
- 🧹 Sensitive data masking in logs

## Audit Logging

All card access attempts are logged with:
- Masked card number (last 4 digits visible)
- Masked user ID
- User role
- Access granted/denied status
- Reason (if denied)
- Automatic trace ID inclusion

Admin full card number access triggers:
- High-priority audit log
- Security team alert
- Enhanced monitoring

## Error Handling

All errors follow a consistent format:

```json
{
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Card not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Codes**:
- `VALIDATION_ERROR` (400): Invalid input
- `UNAUTHORIZED` (401): Missing/invalid authentication
- `ACCESS_FORBIDDEN` (403): Insufficient permissions
- `RESOURCE_NOT_FOUND` (404): Card not found
- `INTERNAL_SERVER_ERROR` (500): Unexpected error

## License

ISC

## Support

For issues or questions, please contact the development team.
