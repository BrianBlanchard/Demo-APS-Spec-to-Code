# SMS Notification Service

A production-ready microservice for delivering critical and time-sensitive SMS notifications including fraud alerts, OTP codes, transaction confirmations, and urgent account status changes.

## Features

- 📱 **Reliable SMS Delivery**: Send SMS messages via Twilio API
- 🔐 **OTP Support**: Generate and deliver one-time passwords
- 📊 **Delivery Tracking**: Track SMS delivery status in real-time
- ✅ **Customer Preferences**: Respect customer opt-in/opt-out preferences
- 🌍 **International Support**: Handle phone numbers in E.164 format
- 🔄 **Retry Logic**: Automatic retry with configurable fallback
- 📧 **Email Fallback**: Optional email delivery if SMS fails
- 🔍 **Distributed Tracing**: Built-in request tracing with trace IDs
- 🛡️ **Security**: Input validation, data masking, audit logging
- 🐳 **Containerized**: Docker and Docker Compose ready

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Validation**: Zod
- **Logging**: Pino
- **SMS Provider**: Twilio
- **Testing**: Jest
- **Build**: TypeScript Compiler (tsc)

## Architecture

```
Controller → Service → Repository → Database
                ↓
            Twilio API
```

### Layers

- **Controller**: Request validation, response formatting
- **Service**: Business logic, retry logic, preferences checking
- **Repository**: Database operations
- **Middleware**: Tracing, error handling, validation

## Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+
- Twilio account (Account SID, Auth Token, Phone Number)
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### 1. Clone and Install

```bash
cd sms_notification_service
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sms_notification_db
DB_USER=postgres
DB_PASSWORD=postgres

# Twilio (REQUIRED)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+15555555555

# Retry Configuration
RETRY_MAX_ATTEMPTS=1
RETRY_DELAY_MS=1000
```

### 3. Database Setup

```bash
# Create database
createdb sms_notification_db

# Run migrations
npm run migrate:latest
```

### 4. Run Development Server

```bash
npm run dev
```

The service will start on `http://localhost:3000`

## API Endpoints

### Send SMS Notification

```http
POST /api/v1/notifications/sms
Content-Type: application/json

{
  "to": "+13125550123",
  "messageType": "fraud_alert",
  "message": "ALERT: Large transaction detected.",
  "priority": "critical"
}
```

**Response (200 OK)**:
```json
{
  "notificationId": "SMS-20240115-ABC456",
  "status": "sent",
  "sentAt": "2024-01-15T14:30:02Z",
  "messageId": "SM1234567890abcdef"
}
```

### Health Checks

- **Liveness**: `GET /health/live` - Container is running
- **Readiness**: `GET /health/ready` - Service is ready (DB connected)
- **Health**: `GET /v1/sms-notification/health` - General health info

## Message Types

- `fraud_alert` - Fraud detection alerts
- `otp` - One-time passwords
- `transaction_confirmation` - Transaction confirmations
- `account_status` - Account status updates

## Priority Levels

- `critical` - Highest priority
- `high` - High priority
- `medium` - Medium priority
- `low` - Lowest priority

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| SMS delivery failure | Retry once, fallback to email if configured |
| Customer opted out | Skip SMS, send email instead, log preference |
| Invalid phone number | Return 400 Bad Request with validation message |
| Twilio API unavailable | Queue message for retry, return queued status |

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Coverage Thresholds

- Statements: ≥ 90%
- Branches: ≥ 90%
- Lines: ≥ 95%
- Functions: ≥ 95%

## Build and Deploy

### Local Build

```bash
npm run build
npm start
```

### Docker Build

```bash
docker build -t sms-notification-service .
docker run -p 3000:3000 --env-file .env sms-notification-service
```

### Docker Compose

```bash
docker-compose up -d
```

This starts:
- SMS Notification Service (port 3000)
- PostgreSQL 16 (port 5432)

### Production Deployment

1. Build the Docker image
2. Set environment variables
3. Run database migrations
4. Deploy container to orchestration platform (Kubernetes, ECS, etc.)
5. Configure health checks and load balancer

## Logging

The service uses structured logging with Pino. All logs include:

- **traceId**: Automatically captured via AsyncLocalStorage
- **timestamp**: ISO8601 format
- **level**: info, warn, error, debug
- **context**: Request path, method, etc.

Sensitive data (phone numbers, customer IDs) are automatically masked in audit logs.

## API Documentation

OpenAPI 3.0 specification is available at:
- **File**: `swagger/sms-notification-openapi.yaml`
- **Swagger UI**: Import the YAML file into Swagger UI or Redoc

## Security Considerations

- ✅ Input validation with Zod
- ✅ Phone number masking in logs
- ✅ Environment-based configuration
- ✅ Non-root container user
- ✅ TLS/SSL for Twilio API calls
- ✅ Centralized error handling
- ✅ Audit trail for all operations

## Monitoring

### Health Endpoints

- `/health/live`: Liveness probe for container orchestration
- `/health/ready`: Readiness probe for load balancers
- `/v1/sms-notification/health`: General health and version info

### Metrics

All operations are logged with:
- Event type (SMS_SENT, SMS_RETRY, SMS_FAILED, CUSTOMER_OPTED_OUT)
- Phone number (masked)
- Message type and priority
- Retry count and failure reasons
- Trace ID for correlation

## Development

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
npm run format:check
```

### Project Structure

```
sms_notification_service/
├── src/
│   ├── controllers/       # HTTP request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access layer
│   ├── middleware/        # Express middleware
│   ├── dtos/              # Data transfer objects
│   ├── types/             # TypeScript types and enums
│   ├── config/            # Configuration management
│   ├── routes/            # API routes
│   ├── app.ts             # Express app setup
│   └── index.ts           # Application entry point
├── migrations/            # Database migrations
├── swagger/               # OpenAPI specification
├── __tests__/             # Test files
├── Dockerfile             # Container definition
├── docker-compose.yml     # Multi-container setup
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── jest.config.js         # Test configuration
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -l | grep sms_notification_db
```

### Twilio API Issues

- Verify Account SID and Auth Token are correct
- Check from number is verified in Twilio
- Ensure account has sufficient balance
- Check Twilio API status page

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001
```

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
