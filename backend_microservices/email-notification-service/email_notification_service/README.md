# Email Notification Service

Email Notification Service delivers transactional emails for customer-facing events including payment confirmations, transaction alerts, card status changes, and monthly statements. Supports templated emails with personalization and tracks delivery status for compliance.

## Features

- **Transactional Email Delivery**: Send templated emails via SendGrid
- **Email Validation**: Validate email addresses before sending
- **Template Management**: Support for multiple email templates with personalization
- **Retry Logic**: Automatic retry with exponential backoff (up to 3 attempts)
- **Audit Trail**: Comprehensive logging of all email operations
- **Delivery Tracking**: Track email delivery status and history
- **Health Checks**: Kubernetes-ready liveness and readiness probes
- **Structured Logging**: JSON-formatted logs with trace ID propagation

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Email Provider**: SendGrid
- **Testing**: Jest
- **Containerization**: Docker, Docker Compose

## Architecture

The application follows a layered architecture:

```
Controller/Router → Service → Repository → Database
                 ↓
            Middleware (Error Handling, Logging, Validation)
```

### Directory Structure

```
email_notification_service/
├── src/
│   ├── config/           # Application configuration
│   ├── controllers/      # HTTP request handlers
│   ├── database/         # Database connection and migrations
│   ├── dto/              # Data Transfer Objects
│   ├── entities/         # Domain models
│   ├── errors/           # Custom error classes
│   ├── middleware/       # Express middleware
│   ├── repositories/     # Data access layer
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── index.ts          # Application entry point
├── swagger/              # OpenAPI specification
├── Dockerfile            # Container definition
├── docker-compose.yml    # Multi-container orchestration
└── package.json          # Dependencies and scripts
```

## Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher
- PostgreSQL 16 (or use Docker Compose)
- SendGrid API Key

## Installation

### 1. Clone and Install Dependencies

```bash
cd email_notification_service
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@example.com
DB_HOST=localhost
DB_PORT=5432
DB_NAME=email_notification_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Database Setup

Run migrations to create database schema and seed templates:

```bash
npm run migrate:latest
```

## Running the Application

### Local Development

```bash
npm run dev
```

The service will start on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

### Docker Compose (Recommended)

Start all services (app + PostgreSQL):

```bash
docker-compose up -d
```

Stop services:

```bash
docker-compose down
```

## API Endpoints

### Email Notifications

**POST /api/v1/notifications/email**

Send an email notification using a template.

**Request:**
```json
{
  "to": "customer@example.com",
  "templateId": "payment_confirmation",
  "templateData": {
    "customerName": "John Anderson",
    "paymentAmount": 2450.75,
    "confirmationNumber": "PAY-20240115-ABC123",
    "paymentDate": "2024-01-15"
  },
  "priority": "high"
}
```

**Response:**
```json
{
  "notificationId": "EMAIL-20240327-A1B2C3D4",
  "status": "sent",
  "sentAt": "2024-03-27T14:30:05Z"
}
```

### Health Checks

**GET /health/live** - Liveness probe (Kubernetes)

**GET /health/ready** - Readiness probe (checks database connectivity)

**GET /** - Service information

## Email Templates

Available templates:

- **payment_confirmation**: Payment confirmation emails
  - Required fields: `customerName`, `paymentAmount`, `confirmationNumber`, `paymentDate`

- **transaction_alert**: Transaction alert notifications
  - Required fields: `customerName`, `transactionAmount`, `transactionDate`

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Error Handling

The service returns standardized error responses:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "timestamp": "2024-03-27T14:30:05Z",
  "traceId": "a1b2c3d4e5f6g7h8"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Invalid request data
- `TEMPLATE_NOT_FOUND`: Template does not exist
- `MISSING_TEMPLATE_FIELDS`: Required template fields missing
- `EMAIL_DELIVERY_FAILED`: Email delivery failed after retries
- `SENDGRID_ERROR`: SendGrid API error
- `INTERNAL_SERVER_ERROR`: Unexpected error

## Logging

The application uses structured JSON logging with automatic trace ID propagation:

```json
{
  "level": "info",
  "time": "2024-03-27T14:30:05.123Z",
  "event": "EMAIL_SENT",
  "notificationId": "EMAIL-20240327-A1B2C3D4",
  "to": "c***r@example.com",
  "templateId": "payment_confirmation",
  "traceId": "a1b2c3d4e5f6g7h8"
}
```

Sensitive data (email addresses, personal information) is automatically masked in logs.

## API Documentation

Interactive API documentation is available via OpenAPI specification:

- **Swagger UI**: View `swagger/email-notification-openapi.yaml` in Swagger Editor
- **Redoc**: Import the OpenAPI file into Redoc for documentation

## Development

### Database Migrations

Create a new migration:

```bash
npm run migrate:make migration_name
```

Run migrations:

```bash
npm run migrate:latest
```

Rollback migrations:

```bash
npm run migrate:rollback
```

## Deployment

### Container Deployment

Build and push Docker image:

```bash
docker build -t email-notification-service:latest .
docker push your-registry/email-notification-service:latest
```

### Kubernetes Deployment

The service includes health check endpoints for Kubernetes:

- Liveness: `GET /health/live`
- Readiness: `GET /health/ready`

### Environment Variables

Required environment variables for production:

- `SENDGRID_API_KEY`: SendGrid API key (required)
- `SENDGRID_FROM_EMAIL`: Default sender email
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (production/development)

## Monitoring

The service provides:

- **Health endpoints** for monitoring
- **Structured logs** for aggregation (ELK, Datadog, etc.)
- **Trace IDs** for distributed tracing
- **Audit logs** for compliance

## Security

- TLS/SSL encryption in transit
- Input validation with Zod
- SQL injection protection via parameterized queries
- Sensitive data masking in logs
- Non-root container user
- Environment-based configuration

## License

ISC

## Support

For issues or questions, contact: support@example.com
