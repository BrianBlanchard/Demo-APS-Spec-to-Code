# Customer Search Service

Customer Search Service enables store associates to quickly search and locate customer profiles using partial name, phone, email, or loyalty card number. Powers the in-store clienteling interface with sub-2-second response time SLA.

## Features

- **Fast Search**: Sub-2-second response time (p95)
- **Fuzzy Matching**: Handles typos and partial input
- **Multi-field Search**: Search by name, email, phone, loyalty card
- **Intelligent Ranking**: Results ranked by relevance, recency, and loyalty tier
- **Fallback Strategy**: Automatic fallback to PostgreSQL if Elasticsearch unavailable
- **Caching**: Redis caching for frequent queries (TTL: 1 minute)
- **Audit Logging**: Comprehensive search audit trail
- **Rate Limiting**: 60 requests/min per user
- **Health Checks**: Readiness and liveness probes

## Technology Stack

- **Runtime**: Node.js 20 LTS+
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Search Engine**: Elasticsearch 8.12
- **Cache**: Redis 7
- **Testing**: Jest
- **Containerization**: Docker, Docker Compose

## Architecture

```
Controller/Router → Service → Repository → DB/Elasticsearch/Redis
```

### Layers

- **Controllers**: Handle HTTP requests, validation, response construction
- **Services**: Business logic, orchestration, caching, audit
- **Repositories**: Data access, Elasticsearch queries, PostgreSQL fallback
- **Middleware**: Context, authentication, error handling, rate limiting

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Check service health**:
   ```bash
   curl http://localhost:3000/health/ready
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

### Search Customers

**Endpoint**: `GET /api/v1/customers/search`

**Headers**:
- `Authorization: Bearer <JWT_TOKEN>` (required)
- `x-user-id: <USER_ID>` (required)
- `x-user-role: associate|manager|admin` (required)
- `x-trace-id: <TRACE_ID>` (optional)

**Query Parameters**:
- `query` (required): Search query text (min 2 characters)
- `search_fields` (optional): Comma-separated fields (name,email,phone,loyalty_card)
- `loyalty_tier` (optional): Comma-separated tiers (vip,gold,silver)
- `store_id` (optional): Filter by last visit store
- `limit` (optional): Results per page (1-50, default 10)
- `offset` (optional): Pagination offset (default 0)

**Example Request**:
```bash
curl -X GET 'http://localhost:3000/api/v1/customers/search?query=john%20smith&limit=10' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'x-user-id: user-123' \
  -H 'x-user-role: associate'
```

**Example Response**:
```json
{
  "total_results": 2,
  "results": [
    {
      "profile_id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Smith",
      "email": "john.smith@example.com",
      "phone": "+14155551234",
      "loyalty_card": "PGA12345678",
      "loyalty_tier": "vip",
      "last_activity": "2026-03-25T18:45:00Z",
      "last_visit_store": "store-123",
      "match_score": 98.5,
      "highlights": {
        "name": "<em>John Smith</em>"
      }
    }
  ],
  "query_time_ms": 145,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "has_more": false
  }
}
```

### Health Checks

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe (checks dependencies)
- `GET /health/live` - Liveness probe
- `GET /v1/customer-search-service/health` - Versioned health check

## Database Schema

### customer_profiles

| Column | Type | Description |
|--------|------|-------------|
| profile_id | UUID | Primary key |
| first_name | VARCHAR(100) | Customer first name |
| last_name | VARCHAR(100) | Customer last name |
| email | VARCHAR(255) | Customer email (unique) |
| phone | VARCHAR(20) | Phone number (E.164 format) |
| loyalty_card | VARCHAR(50) | Loyalty card number (unique) |
| loyalty_tier | VARCHAR(20) | Loyalty tier (vip, gold, silver) |
| last_activity | TIMESTAMPTZ | Last customer activity |
| last_visit_store | VARCHAR(100) | Last visited store ID |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Record update timestamp |

### search_audit_logs

| Column | Type | Description |
|--------|------|-------------|
| search_id | UUID | Primary key |
| user_id | VARCHAR(100) | Searching associate ID |
| query | TEXT | Search query text |
| filters | JSONB | Applied filters |
| result_count | INTEGER | Number of results |
| query_time_ms | INTEGER | Execution time (ms) |
| zero_results | BOOLEAN | No results flag |
| created_at | TIMESTAMPTZ | Search timestamp |

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Coverage Thresholds

- Statements: ≥90%
- Branches: ≥90%
- Lines: ≥95%
- Functions: ≥95%
- Modules: 100%

## Configuration

All configuration is managed via environment variables. See `.env.example` for available options.

### Key Configuration

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development, production, test)
- `DB_*`: PostgreSQL configuration
- `ES_*`: Elasticsearch configuration
- `REDIS_*`: Redis configuration
- `JWT_SECRET`: JWT token secret
- `RATE_LIMIT_*`: Rate limiting configuration
- `LOG_LEVEL`: Logging level (info, debug, error, warn)

## Development

### Code Style

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Type Checking**: `npm run build`

### Project Structure

```
src/
├── config/           # Configuration management
├── controllers/      # HTTP request handlers
├── middleware/       # Express middleware
├── repositories/     # Data access layer
├── routes/           # Route definitions
├── services/         # Business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── app.ts            # Express app setup
└── index.ts          # Application entry point
```

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- `swagger/customer-search-openapi.yaml`
- Can be viewed in Swagger UI or Redoc

## Deployment

### Production Considerations

1. **Environment Variables**: Set secure values for all secrets
2. **Database**: Use managed PostgreSQL with replication
3. **Elasticsearch**: Use managed Elasticsearch cluster
4. **Redis**: Use managed Redis with persistence
5. **Monitoring**: Integrate with APM tools (pino logger supports structured logs)
6. **Security**:
   - Use strong JWT secrets
   - Enable TLS/SSL for all connections
   - Implement proper CORS configuration
   - Use environment-specific rate limits

### Scaling

- **Horizontal Scaling**: Service is stateless, can scale horizontally
- **Database**: Use read replicas for search queries
- **Elasticsearch**: Scale cluster based on data volume and query load
- **Redis**: Use Redis Cluster for high availability

## Monitoring

### Metrics to Monitor

- Request rate and response times
- Error rates by status code
- Elasticsearch query times
- PostgreSQL fallback usage
- Cache hit/miss ratio
- Rate limit violations
- Zero-result searches

### Health Endpoints

Use `/health/ready` and `/health/live` for Kubernetes probes:

```yaml
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
  initialDelaySeconds: 10
  periodSeconds: 5
```

## License

ISC

## Support

For issues and questions, please contact the API support team at support@example.com.
