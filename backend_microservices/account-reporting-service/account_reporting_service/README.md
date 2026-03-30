# Account Reporting Service

Account Reporting Service generates account-level reports including account status summaries, credit utilization analysis, delinquency reports for collections, and monthly customer statements. Supports regulatory reporting and portfolio management analysis.

## Features

- Generate monthly account statements
- Report on account status distribution
- Analyze credit utilization across portfolio
- Identify delinquent accounts for collections
- Support portfolio risk analysis

## Technology Stack

- **Language:** TypeScript 5.x
- **Runtime:** Node.js 20 LTS+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Migration:** Knex.js
- **Testing:** Jest
- **Logging:** Pino

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- npm or pnpm

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

## Database Setup

```bash
# Run migrations
npm run migrate:latest

# Rollback migrations (if needed)
npm run migrate:rollback
```

## Development

```bash
# Start development server with hot reload
npm run dev
```

The service will start on `http://localhost:3000` (or the port specified in `.env`).

## Building

```bash
# Build for production
npm run build
```

## Running in Production

```bash
# Start production server
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Docker

### Build and Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Build Docker Image

```bash
# Build image
docker build -t account-reporting-service .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=account_reporting \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  account-reporting-service
```

## API Endpoints

### Business APIs

#### Generate Account Report

**Endpoint:** `POST /api/v1/reports/accounts`

**Request:**
```json
{
  "reportType": "account_status",
  "asOfDate": "2024-01-31",
  "format": "csv"
}
```

**Response:**
```json
{
  "reportId": "RPT-20240131-XYZ789",
  "reportType": "account_status",
  "totalAccounts": 10543,
  "activeAccounts": 9821,
  "suspendedAccounts": 432,
  "closedAccounts": 290,
  "downloadUrl": "https://reports.example.com/RPT-20240131-XYZ789.csv"
}
```

### Health Check Endpoints

- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe (includes database check)
- `GET /v1/account-reporting-service/health` - Detailed health status

## Architecture

### Layered Architecture

```
Controller (HTTP Layer)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database (PostgreSQL)
```

### Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # HTTP request handlers
├── dtos/            # Data Transfer Objects
├── entities/        # Domain entities
├── errors/          # Error classes
├── middleware/      # Express middleware
├── repositories/    # Database access layer
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Application setup
└── index.ts         # Entry point

migrations/          # Database migrations
swagger/            # OpenAPI specification
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `account_reporting` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_POOL_MIN` | Min connection pool size | `2` |
| `DB_POOL_MAX` | Max connection pool size | `10` |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `REPORT_BASE_URL` | Report download base URL | `https://reports.example.com` |
| `REPORT_STORAGE_PATH` | Report storage path | `/tmp/reports` |

## Error Handling

All errors follow a standardized format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Date must be in YYYY-MM-DD format",
  "timestamp": "2024-01-31T10:30:00.000Z",
  "traceId": "a1b2c3d4e5f6g7h8"
}
```

### Error Codes

- `VALIDATION_ERROR` - Invalid request parameters (400)
- `NOT_FOUND` - Resource not found (404)
- `DATABASE_ERROR` - Database operation failed (500)
- `REPORT_GENERATION_ERROR` - Report generation failed (500)
- `INTERNAL_SERVER_ERROR` - Unexpected error (500)

## Audit Logging

All operations are logged with:
- Action performed
- Resource affected
- Status (success/failure)
- Trace ID for correlation
- Masked sensitive data

## Security

- Input validation using Zod schemas
- Sensitive data masking in logs and errors
- Request context isolation using AsyncLocalStorage
- Graceful shutdown handling
- Health check endpoints for monitoring

## OpenAPI Specification

The complete API specification is available at:
- `swagger/account-reporting-openapi.yaml`

View in Swagger UI:
```bash
# Using npx
npx swagger-ui-serve swagger/account-reporting-openapi.yaml
```

## License

ISC
