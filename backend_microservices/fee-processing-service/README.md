# Fee Processing Service

## Overview

The Fee Processing Service is a production-ready TypeScript/Node.js application that processes various account fees including late payment fees, annual fees, over-limit fees, and cash advance fees. It posts fees as transaction type 04 with appropriate descriptions and supports both automated batch fee processing and manual fee assessment.

## Features

- **Multiple Fee Types Support**: late_payment, annual_fee, over_limit, cash_advance, returned_payment
- **Transaction Management**: Creates and posts fee transactions (type '04')
- **Account Balance Updates**: Automatically updates account balances after fee posting
- **Comprehensive Audit Logging**: Structured logging with trace ID correlation
- **Health Checks**: Readiness and liveness probes for container orchestration
- **OpenAPI Documentation**: Complete API specification in Swagger/OpenAPI 3.0 format
- **Containerized Deployment**: Docker and docker-compose support
- **Database Migrations**: Automated schema management with Knex.js

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Migration**: Knex.js
- **Validation**: Zod
- **Logging**: Pino (structured logging)
- **Testing**: Jest
- **Build Tool**: npm

## Architecture

The application follows a layered architecture pattern:

```
Controller/Router → Service → Repository → Database
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Data access layer
- **Middleware**: Request context, error handling
- **DTOs**: Request/response data transfer objects
- **Entities**: Domain models

## Project Structure

```
fee_processing_service/
├── src/
│   ├── controllers/       # HTTP controllers
│   ├── services/          # Business logic services
│   ├── repositories/      # Data access layer
│   ├── dtos/              # Data transfer objects
│   ├── entities/          # Domain entities
│   ├── middleware/        # Express middleware
│   ├── routes/            # Route definitions
│   ├── config/            # Configuration
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── app.ts             # Application setup
│   └── index.ts           # Entry point
├── migrations/            # Database migrations
├── swagger/               # OpenAPI specification
├── __tests__/             # Test files
├── Dockerfile             # Container definition
├── docker-compose.yml     # Container orchestration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Test configuration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher
- PostgreSQL 16 or higher (or Docker)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment configuration:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

### Database Setup

Run migrations to create database schema:

```bash
npm run migrate:latest
```

### Running the Application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

### Using Docker

**Build and run with Docker Compose:**

```bash
docker-compose up -d
```

**View logs:**

```bash
docker-compose logs -f app
```

**Stop services:**

```bash
docker-compose down
```

## API Endpoints

### Fee Processing

**POST** `/api/v1/fees/assess`

Assess and post a fee to an account.

**Request:**
```json
{
  "accountId": "12345678901",
  "feeType": "late_payment",
  "amount": 35.00,
  "reason": "Payment past due date"
}
```

**Response:**
```json
{
  "accountId": "12345678901",
  "feeType": "late_payment",
  "amount": 35.00,
  "transactionId": "1234567890123456",
  "posted": true
}
```

### Health Checks

**GET** `/health/ready` - Readiness probe (checks database connectivity)

**GET** `/health/live` - Liveness probe

**GET** `/v1/fees/health/ready` - Versioned readiness probe

**GET** `/v1/fees/health/live` - Versioned liveness probe

## Fee Types

- `late_payment`: Late payment fee
- `annual_fee`: Annual account fee
- `over_limit`: Over credit limit fee
- `cash_advance`: Cash advance fee
- `returned_payment`: Returned payment fee

## Validation Rules

- **Account ID**: Must be exactly 11 numeric digits
- **Fee Type**: Must be one of the valid fee types
- **Amount**: Must be positive with at most 2 decimal places
- **Reason**: Required, non-empty string

## Error Handling

All errors follow a standard format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Account ID must be exactly 11 digits",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Codes:**
- `VALIDATION_ERROR` (400): Request validation failed
- `NOT_FOUND` (404): Account not found
- `BUSINESS_ERROR` (422): Business rule violation
- `INTERNAL_SERVER_ERROR` (500): Unexpected error

## Audit Logging

All operations are logged with:
- Structured JSON format
- Automatic trace ID correlation
- Sensitive data masking (account IDs)
- Timestamp and service context

## Testing

**Run all tests:**

```bash
npm test
```

**Run tests with coverage:**

```bash
npm run test:coverage
```

**Run tests in watch mode:**

```bash
npm run test:watch
```

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%

## Development

**Linting:**

```bash
npm run lint
```

**Code formatting:**

```bash
npm run format
```

## OpenAPI Documentation

The complete API specification is available at:

```
swagger/fee-processing-openapi.yaml
```

To view the documentation:
1. Open [Swagger Editor](https://editor.swagger.io/)
2. Import the `fee-processing-openapi.yaml` file

Or use Swagger UI locally:

```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/api/swagger/fee-processing-openapi.yaml -v $(pwd)/swagger:/api/swagger swaggerapi/swagger-ui
```

Then navigate to `http://localhost:8080`

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| SERVICE_NAME | Service identifier | fee-processing-service |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | fee_processing |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_POOL_MIN | Min connection pool size | 2 |
| DB_POOL_MAX | Max connection pool size | 10 |
| CORS_ORIGIN | CORS allowed origin | * |
| LOG_LEVEL | Logging level | info |

## Deployment

### Container Deployment

The service is designed for containerized deployment with:

- Multi-stage Dockerfile for optimized image size
- Health checks for orchestration
- Graceful shutdown handling
- Database connection pooling
- Environment-specific configuration

### Kubernetes Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fee-processing-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: fee-processing-service:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Security

- Input validation on all requests
- Sensitive data masking in logs
- SQL injection prevention via parameterized queries
- CORS configuration
- Graceful error handling without exposing internals

## License

ISC

## Support

For issues or questions, please contact the development team.
