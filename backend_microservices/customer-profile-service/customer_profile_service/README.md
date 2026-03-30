# Customer Profile Service

A production-ready Node.js/TypeScript service providing secure access to customer profile information with role-based field visibility, comprehensive audit trails, and caching support.

## Features

- **Role-Based Access Control**: Different field visibility for ADMIN, CSR, and CUSTOMER roles
- **Caching**: Redis-based caching with 5-minute TTL for optimized performance
- **Audit Logging**: Complete audit trail for all profile modifications with field-level tracking
- **Optimistic Locking**: Prevents concurrent update conflicts with version-based locking
- **Rate Limiting**: Configurable rate limits (GET: 500/min, PUT: 100/min per user)
- **Request Tracing**: Automatic trace ID propagation using AsyncLocalStorage
- **Health Checks**: Kubernetes-ready liveness and readiness probes
- **OpenAPI Documentation**: Complete Swagger/OpenAPI 3.0 specification
- **Containerization**: Multi-stage Docker build with security best practices

## Technology Stack

- **Language**: TypeScript 5.x (strict mode)
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js migrations
- **Cache**: Redis
- **Logging**: Pino with structured logging
- **Validation**: Zod
- **Testing**: Jest with pg-mem and Testcontainers
- **Build**: TypeScript Compiler (tsc)
- **Linting**: ESLint + Prettier

## Architecture

```
Controller/Router → Service → Repository → Database
                 ↓
            Middleware (Auth, Validation, Tracing, Error Handling)
                 ↓
         Cross-cutting Concerns (Cache, Audit, Logging)
```

### Layered Architecture

- **Controllers**: Handle HTTP requests/responses, validation, and routing
- **Services**: Contain business logic, orchestrate operations
- **Repositories**: Data access layer, database interactions
- **Middleware**: Authentication, tracing, rate limiting, error handling
- **Utilities**: Masking, validation, mapping, tracing

## API Endpoints

### Customer Operations

- `GET /api/v1/customers/{customerId}` - Retrieve customer profile
  - Query params: `includeAccounts`, `includeCards`
  - Rate limit: 500 requests/minute
  - Timeout: 5 seconds

- `PUT /api/v1/customers/{customerId}` - Update customer profile
  - Rate limit: 100 requests/minute
  - Timeout: 10 seconds

### Health Checks

- `GET /health/live` - Liveness probe (basic service check)
- `GET /health/ready` - Readiness probe (includes DB and Redis connectivity)
- `GET /api/customer-profile/health` - Alternative health endpoint

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- Redis 7
- npm or pnpm

### Local Development Setup

1. **Clone and install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your local configuration
```

3. **Start PostgreSQL and Redis** (using Docker)

```bash
docker-compose up -d postgres redis
```

4. **Run database migrations**

```bash
npm run migrate:latest
```

5. **Start development server**

```bash
npm run dev
```

The service will be available at `http://localhost:3000`

### Docker Deployment

**Build and run all services**:

```bash
docker-compose up --build
```

**Run in detached mode**:

```bash
docker-compose up -d
```

**View logs**:

```bash
docker-compose logs -f app
```

**Stop services**:

```bash
docker-compose down
```

**Stop and remove volumes**:

```bash
docker-compose down -v
```

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `customer_profile_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_TTL` | Cache TTL in seconds | `300` |
| `LOG_LEVEL` | Logging level (info/debug/error) | `info` |
| `RATE_LIMIT_GET_MAX` | GET rate limit per minute | `500` |
| `RATE_LIMIT_PUT_MAX` | PUT rate limit per minute | `100` |

See `.env.example` for complete list of configuration options.

## Authentication

The service expects a **Bearer JWT token** in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Mock Token Format (Development Only)

For local testing, tokens are base64-encoded strings with format:

```
{userId}:{role}:{customerId}
```

Example (ADMIN role):

```bash
echo -n "ADMIN001:ADMIN:" | base64
# Result: QURNSU4wMDE6QURNSU46
```

Example (CSR role):

```bash
echo -n "CSR00123:CSR:" | base64
```

Example (CUSTOMER self-service):

```bash
echo -n "123456789:CUSTOMER:123456789" | base64
```

**Production**: Replace with proper JWT verification using `jsonwebtoken` library.

## Role-Based Field Visibility

### ADMIN Role
- Full access to all fields including SSN, government ID, and FICO score
- Can update restricted fields

### CSR Role
- Partial SSN masking: `***-**-6789`
- Full government ID masking: `***45678`
- FICO score hidden
- Cannot update restricted fields

### CUSTOMER Role
- Can only access own data
- Full masking of sensitive fields
- Cannot update restricted fields (SSN, DOB, FICO score)

## Testing

### Run all tests

```bash
npm test
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Coverage thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

### Test structure

```
src/
  __tests__/
    unit/           # Unit tests (DTOs, utilities, services)
    integration/    # Integration tests (repositories, full flow)
    contract/       # API contract tests
```

## Database Migrations

### Create new migration

```bash
npm run migrate:make migration_name
```

### Run migrations

```bash
npm run migrate:latest
```

### Rollback last migration

```bash
npm run migrate:rollback
```

## Database Schema

### customers table

| Column | Type | Description |
|--------|------|-------------|
| customer_id | CHAR(9) | Primary key |
| first_name | VARCHAR(25) | Customer first name |
| last_name | VARCHAR(25) | Customer last name |
| ssn | VARCHAR(11) | Social Security Number |
| fico_score | INTEGER | Credit score |
| status | ENUM | active/inactive/suspended |
| version | INTEGER | Optimistic lock version |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| updated_by | VARCHAR(8) | User who last updated |

### audit_logs table

| Column | Type | Description |
|--------|------|-------------|
| audit_id | UUID | Primary key |
| customer_id | CHAR(9) | Foreign key |
| field_name | VARCHAR(50) | Modified field name |
| old_value | TEXT | Previous value (masked) |
| new_value | TEXT | New value (masked) |
| changed_at | TIMESTAMPTZ | Change timestamp |
| changed_by | VARCHAR(8) | User who made change |
| ip_address | INET | Source IP address |
| trace_id | VARCHAR(36) | Request trace ID |

## Code Quality

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
npm run format:check
```

### Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

## API Documentation

### Swagger UI

OpenAPI specification: `swagger/customer-profile-openapi.yaml`

View in Swagger Editor:
1. Go to https://editor.swagger.io/
2. Import `swagger/customer-profile-openapi.yaml`

Or use Swagger UI locally:

```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/api/customer-profile-openapi.yaml \
  -v $(pwd)/swagger:/api swaggerapi/swagger-ui
```

Access at: http://localhost:8080

## Monitoring & Observability

### Health Checks

**Liveness**: `GET /health/live`
- Returns 200 if service is running
- Use for Kubernetes liveness probe

**Readiness**: `GET /health/ready`
- Returns 200 if service + dependencies are healthy
- Returns 503 if database or Redis is unavailable
- Use for Kubernetes readiness probe

### Logging

All logs use structured JSON format with:
- `traceId`: Automatically captured from AsyncLocalStorage
- `userId`: Automatically captured from request context
- `timestamp`: ISO 8601 format
- `level`: info/warn/error
- `service`: customer-profile-service

### Request Tracing

Every request gets a unique `X-Trace-Id` header (auto-generated or client-provided).
Trace IDs are:
- Propagated through all service layers via AsyncLocalStorage
- Included in all log statements
- Returned in response headers
- Stored in audit logs

## Security Features

- **Helmet**: Security headers enabled
- **CORS**: Configurable origin whitelist
- **Rate Limiting**: Per-endpoint rate limits
- **Input Validation**: Zod schema validation on all requests
- **Data Masking**: Role-based sensitive field masking
- **Audit Trail**: Complete history of all data modifications
- **Non-root Container**: Runs as nodejs user (UID 1001)
- **Optimistic Locking**: Prevents concurrent update conflicts

## Error Handling

All errors follow standard format:

```json
{
  "errorCode": "ERROR_CODE",
  "message": "Human-readable message",
  "timestamp": "2024-01-21T10:30:00Z",
  "traceId": "uuid",
  "details": {
    "field": "Field-specific error message"
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400): Input validation failed
- `UNAUTHORIZED` (401): Invalid or missing JWT
- `FORBIDDEN` (403): Insufficient privileges
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Optimistic lock failure
- `UNPROCESSABLE_ENTITY` (422): Business rule violation
- `INTERNAL_SERVER_ERROR` (500): Unexpected error

## Performance Optimization

- **Redis Caching**: 5-minute TTL on customer profiles
- **Database Connection Pooling**: Min 2, Max 10 connections
- **Query Optimization**: Indexed columns (customer_id, ssn, status)
- **Optimistic Locking**: Version-based concurrency control
- **Rate Limiting**: Prevents abuse and resource exhaustion

## Production Deployment

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: customer-profile-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: customer-profile-service:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
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
          initialDelaySeconds: 10
          periodSeconds: 10
```

### Environment-Specific Configuration

Use separate `.env` files or Kubernetes ConfigMaps/Secrets for:
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

## Troubleshooting

### Database connection issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Test connection
psql -h localhost -U postgres -d customer_profile_db
```

### Redis connection issues

```bash
# Check Redis is running
docker-compose ps redis

# View Redis logs
docker-compose logs redis

# Test connection
redis-cli -h localhost ping
```

### Application logs

```bash
# Development (pretty print)
npm run dev

# Docker
docker-compose logs -f app

# Production (JSON format)
NODE_ENV=production npm start
```

## Contributing

1. Follow TypeScript strict mode guidelines
2. Maintain test coverage thresholds
3. Use conventional commit messages
4. Run linting and formatting before commits
5. Update OpenAPI spec for API changes

## License

ISC

## Support

For issues or questions, contact: support@example.com
