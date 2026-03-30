# Customer Registration Service

## Overview

Customer Registration Service for Advanced Payment System. Enables creation of new customer records with comprehensive validation of personal information, contact details, and identity verification.

## Technology Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20 LTS+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Migration**: Knex.js
- **Testing**: Jest
- **Logger**: Pino

## Architecture

The application follows a layered architecture:

```
Controller/Router → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Data access layer
- **Middleware**: Cross-cutting concerns (error handling, tracing, validation)

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Database Setup

```bash
# Run migrations
npm run migrate:latest

# Rollback migrations (if needed)
npm run migrate:rollback
```

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Customer Registration

**POST** `/api/v1/customers`

Create a new customer record.

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Anderson",
  "dateOfBirth": "1985-06-15",
  "ssn": "123-45-6789",
  "governmentId": "DL12345678",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60601",
  "country": "USA",
  "phone1": "312-555-0123",
  "phone2": "312-555-0456",
  "eftAccountId": "EFT987654321",
  "isPrimaryCardholder": true,
  "ficoScore": 720
}
```

**Response (201):**
```json
{
  "customerId": "123456789",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "verificationStatus": "pending",
  "creditLimit": 5000
}
```

### Health Endpoints

**GET** `/health/ready` - Readiness probe (checks database connectivity)

**GET** `/health/live` - Liveness probe (application status)

**GET** `/v1/customer-registration/health` - Alternative health endpoint

## Validation Rules

- **SSN**: First 3 digits cannot be 000, 666, or 900-999
- **Phone**: Valid North American area codes
- **State/ZIP**: Cross-validation for consistency
- **FICO Score**: Must be between 300 and 850
- **Age**: Customer must be at least 18 years old
- **Names**: Alphabetic characters and spaces only
- **Duplicate Check**: SSN and Government ID must be unique

## Error Codes

- `201` - Created successfully
- `400` - Validation errors
- `401` - Unauthorized (invalid/expired JWT)
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (duplicate SSN or Government ID)
- `422` - Unprocessable Entity (business rule violation)
- `500` - Internal Server Error

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%

## Linting and Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Security

- SSN and Government ID are encrypted at rest
- JWT authentication required for all API endpoints
- Role-based access control (ADMIN, CSR roles)
- TLS/SSL encryption in transit
- Input sanitization and validation
- Comprehensive audit logging

## Environment Variables

See `.env.example` for all configuration options.

## License

MIT
