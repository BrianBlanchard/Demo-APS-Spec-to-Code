# Transaction Reporting Service

A comprehensive transaction reporting service that generates reports for operational monitoring, regulatory compliance, and business analysis.

## Features

- **Multiple Report Types**
  - Daily transaction summaries
  - Declined transaction reports
  - Merchant analysis
  - Category-based spending reports

- **Export Formats**
  - PDF reports with optional graphs
  - CSV exports for data analysis

- **Asynchronous Processing**
  - Large date ranges (>90 days) processed asynchronously
  - Notification when reports are ready

- **Production-Ready**
  - Health checks (readiness, liveness)
  - Structured logging with automatic trace ID propagation
  - Audit logging for compliance
  - Error handling with sensitive data masking
  - Database connection pooling
  - Graceful shutdown

## Technology Stack

- **Runtime**: Node.js 20 LTS+
- **Language**: TypeScript 5.x (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js
- **Validation**: Zod
- **Logging**: Pino (structured logging)
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## Architecture

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses, input validation
- **Services**: Pure business logic
- **Repositories**: Data access layer
- **Middleware**: Context propagation, CORS, error handling
- **Utilities**: Logger, ID generation, date validation

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16+
- npm or pnpm

## Installation

### Local Development

1. **Clone and install dependencies**:
   ```bash
   cd transaction_reporting_service
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (if not running):
   ```bash
   # Using Docker
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
   ```

4. **Run database migrations**:
   ```bash
   npm run migrate
   ```

5. **Start the application**:
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

### Docker Deployment

1. **Using Docker Compose** (recommended):
   ```bash
   docker-compose up -d
   ```

   This will start both PostgreSQL and the application with proper networking and health checks.

2. **Build and run manually**:
   ```bash
   # Build image
   docker build -t transaction-reporting-service .

   # Run container
   docker run -p 3000:3000 \
     -e DB_HOST=postgres \
     -e DB_PASSWORD=postgres \
     transaction-reporting-service
   ```

## API Endpoints

### Transaction Reports

**POST** `/api/v1/reports/transactions`

Generate a transaction report.

**Request Body**:
```json
{
  "reportType": "daily_summary",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "format": "pdf",
  "includeGraphs": true
}
```

**Response** (201 Created):
```json
{
  "reportId": "RPT-20240115-ABC123",
  "reportType": "daily_summary",
  "generatedAt": "2024-01-15T10:30:00Z",
  "downloadUrl": "https://reports.example.com/RPT-20240115-ABC123.pdf",
  "expiresAt": "2024-01-22T10:30:00Z"
}
```

### Health Checks

- **GET** `/health/ready` - Readiness probe (checks database)
- **GET** `/health/live` - Liveness probe (basic health)
- **GET** `/api/v1/transaction-reporting/health` - Versioned health check

## Configuration

All configuration is done via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `transaction_reports` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_POOL_MIN` | Minimum connection pool size | `2` |
| `DB_POOL_MAX` | Maximum connection pool size | `10` |
| `REPORT_EXPIRY_DAYS` | Report expiration (days) | `7` |
| `REPORT_DOWNLOAD_BASE_URL` | Base URL for downloads | `https://reports.example.com` |
| `ASYNC_REPORT_THRESHOLD_DAYS` | Threshold for async processing | `90` |
| `LOG_LEVEL` | Logging level | `info` |

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database Migrations

```bash
# Run migrations
npm run migrate

# Rollback migrations
npx knex migrate:rollback --knexfile src/database/knexfile.ts
```

## Project Structure

```
transaction_reporting_service/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # HTTP controllers
│   ├── database/         # Database connection & migrations
│   ├── dto/              # Data Transfer Objects & validation
│   ├── entities/         # Domain models
│   ├── middleware/       # Express middleware
│   ├── repositories/     # Data access layer
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── utils/            # Utilities (logger, errors, etc.)
│   ├── app.ts            # Application setup
│   └── index.ts          # Entry point
├── swagger/              # OpenAPI specification
├── Dockerfile            # Container definition
├── docker-compose.yml    # Multi-container orchestration
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── jest.config.js        # Test configuration
```

## OpenAPI Documentation

The complete API documentation is available in OpenAPI 3.0 format:
- **File**: `swagger/transaction-reporting-openapi.yaml`
- **View**: Import into [Swagger Editor](https://editor.swagger.io/) or use Swagger UI

## Error Handling

All errors return a consistent format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Start date must be before or equal to end date",
  "timestamp": "2024-01-15T10:30:00Z",
  "traceId": "1705320000000-ABC12345"
}
```

Common error codes:
- `VALIDATION_ERROR` (400): Invalid request parameters
- `NOT_FOUND` (404): Resource not found
- `REPORT_GENERATION_ERROR` (500): Report generation failed
- `DATABASE_ERROR` (503): Database unavailable

## Logging & Tracing

- **Structured Logging**: All logs in JSON format via Pino
- **Automatic Trace ID**: Propagated via AsyncLocalStorage (no manual logging needed)
- **Audit Logging**: Separate audit trail for business events
- **Sensitive Data Masking**: Automatic masking of IDs, names, financial info

## Testing Strategy

- **Unit Tests**: All services, repositories, utilities
- **Integration Tests**: Layer interactions, database operations
- **Contract Tests**: API endpoints, request/response schemas
- **Coverage Targets**:
  - Statements: ≥90%
  - Branches: ≥90%
  - Lines: ≥95%
  - Functions: ≥95%
  - Modules: 100%

## Security

- Input validation with Zod
- Sensitive data masking in logs and errors
- Database connection pooling
- CORS configuration (dev vs prod)
- Non-root container user
- Health check endpoints

## License

MIT
