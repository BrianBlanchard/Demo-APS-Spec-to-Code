# Card Replacement Service

A production-ready TypeScript/Node.js microservice for issuing replacement credit cards.

## Overview

The Card Replacement Service handles card replacement requests for various scenarios:
- Lost or stolen cards
- Damaged cards
- Cards nearing expiration
- Fraud prevention

The service automatically invalidates the original card and generates a new card with:
- New 16-digit card number
- New CVV code
- New expiration date (3 years from replacement)
- Same account and customer associations

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Migration**: Knex.js
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## Architecture

The service follows a clean layered architecture:

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic implementation
- **Repositories**: Data access layer
- **Middleware**: Cross-cutting concerns (logging, validation, error handling)

## Project Structure

```
card_replacement_service/
├── src/
│   ├── config/           # Configuration (database, logger)
│   ├── controllers/      # HTTP controllers
│   ├── middleware/       # Express middleware
│   ├── repositories/     # Data access layer
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types, DTOs, entities
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── index.ts          # Application entry point
├── migrations/           # Database migrations
├── swagger/              # OpenAPI specification
├── __tests__/            # Test files
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
└── package.json          # Dependencies and scripts
```

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- Docker (optional, for containerized deployment)

## Installation

### Local Development

1. **Clone and navigate to the project**:
   ```bash
   cd card_replacement_service
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL** (if not using Docker):
   ```bash
   # Using your local PostgreSQL installation
   createdb card_replacement_db
   ```

5. **Run database migrations**:
   ```bash
   npm run migrate:latest
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

The service will be available at `http://localhost:3000`.

### Docker Deployment

1. **Start services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

This will start both the application and PostgreSQL database.

2. **Check service health**:
   ```bash
   curl http://localhost:3000/health
   ```

## API Endpoints

### Card Replacement

**POST** `/api/v1/cards/{cardNumber}/replace`

Request card replacement.

**Headers**:
- `Authorization`: Bearer JWT token (required)
- `x-trace-id`: UUID for request tracking (optional)

**Path Parameters**:
- `cardNumber`: 16-digit card number

**Request Body**:
```json
{
  "replacementReason": "lost_or_stolen",
  "deliveryAddress": {
    "line1": "456 Oak Avenue",
    "line2": "Suite 200",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60602"
  },
  "expeditedShipping": true,
  "notifyCustomer": true
}
```

**Response** (201 Created):
```json
{
  "originalCardNumber": "************1234",
  "originalCardStatus": "inactive",
  "replacementCardNumber": "************5678",
  "replacementCardStatus": "active",
  "accountId": "12345678901",
  "customerId": "123456789",
  "embossedName": "JOHN M ANDERSON",
  "expirationDate": "01/27",
  "issuedDate": "2024-01-15",
  "estimatedDelivery": "2024-01-17",
  "shippingMethod": "expedited",
  "activationRequired": true
}
```

### Health Checks

- **GET** `/health` - Overall health status
- **GET** `/health/live` - Liveness probe (Kubernetes)
- **GET** `/health/ready` - Readiness probe (Kubernetes)

## Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | card_replacement_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `CORS_ORIGIN` | CORS allowed origin | * |
| `LOG_LEVEL` | Logging level | info |

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run migrate:latest` - Run database migrations
- `npm run migrate:rollback` - Rollback last migration

### Running Tests

```bash
npm test
```

### Code Quality

The project enforces:
- **TypeScript strict mode**
- **ESLint** for linting
- **Prettier** for formatting
- **Test coverage thresholds**: ≥90% statements/branches, ≥95% lines/functions

## Database Schema

### Tables

1. **cards** - Card information
   - `card_number` (PK): 16-digit card number
   - `account_id`: Account identifier
   - `customer_id`: Customer identifier
   - `embossed_name`: Name on card
   - `cvv`: Card verification value
   - `expiration_date`: Card expiry date
   - `issued_date`: Date card was issued
   - `status`: Card status (active/inactive/suspended/replaced)

2. **card_replacement_history** - Replacement tracking
   - `replacement_id` (PK): UUID
   - `original_card_number` (FK): Original card
   - `replacement_card_number` (FK): New card
   - `replacement_reason`: Reason for replacement
   - `requested_by`: User who requested
   - `requested_at`: Timestamp
   - `expedited_shipping`: Shipping method flag
   - `estimated_delivery`: Expected delivery date
   - Delivery address fields

3. **audit_logs** - Audit trail
   - `id` (PK): UUID
   - `event_type`: Type of event
   - `entity_type`: Entity affected
   - `entity_id`: Entity identifier
   - `user_id`: User who triggered event
   - `trace_id`: Request trace ID
   - `event_data`: JSON event details
   - `timestamp`: Event timestamp

## API Documentation

OpenAPI 3.0 specification is available at:
```
swagger/card-replacement-openapi.yaml
```

View in Swagger UI:
1. Install Swagger UI locally or use [Swagger Editor](https://editor.swagger.io/)
2. Load the `swagger/card-replacement-openapi.yaml` file

## Security

- **Authentication**: Bearer JWT tokens required for all card operations
- **Rate Limiting**: 50 requests per minute per user
- **Request Timeout**: 15 seconds
- **Card Masking**: Only last 4 digits shown in responses
- **Audit Logging**: All card operations logged with masked data
- **TLS/SSL**: Required for production deployments

## Error Handling

All errors follow a standard format:

```json
{
  "errorCode": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Codes**:
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Card not found
- `422` - Unprocessable entity (card already replaced)
- `500` - Internal server error

## Logging

The service uses structured logging with **Pino**:
- Automatic trace ID propagation via AsyncLocalStorage
- Structured JSON logs in production
- Pretty-printed logs in development
- Log levels: error, warn, info, debug, trace

## Monitoring & Observability

- **Health Checks**: `/health`, `/health/live`, `/health/ready`
- **Trace IDs**: Automatic propagation through AsyncLocalStorage
- **Audit Logs**: Separate audit trail in database
- **Docker Health Checks**: Built into container

## Future Enhancements

- Kafka event publishing for `CardReplaced` events
- Card production service integration
- Customer notification service integration
- Rate limiting implementation
- Comprehensive authentication/authorization
- Metrics and monitoring (Prometheus/Grafana)

## License

ISC

## Support

For issues and questions, please contact the development team.
