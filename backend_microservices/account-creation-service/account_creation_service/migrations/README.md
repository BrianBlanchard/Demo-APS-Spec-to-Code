# Database Migrations

This directory contains SQL migration scripts for the Account Creation Service database schema.

## Running Migrations

### Using psql

```bash
# Connect to your PostgreSQL database
psql -h localhost -U postgres -d account_service -f migrations/001_create_tables.sql
```

### Using Docker Compose

The migrations are automatically applied when using docker-compose (see docker-compose.yml).

## Migration Files

- `001_create_tables.sql`: Creates all tables, indexes, sequences, and inserts sample data

## Schema Overview

### Tables

- **customers**: Customer master records with KYC status
- **disclosure_groups**: Disclosure group configurations for interest rates
- **account_type_configs**: Account type term configurations
- **accounts**: Account master records
- **account_balances**: Account balance tracking (one-to-one with accounts)
- **audit_logs**: Audit trail for all account operations

### Sequences

- **account_id_seq**: Generates unique 11-digit account identifiers

### Sample Data

The migration includes sample data for:
- 3 customers (different KYC statuses)
- 3 disclosure groups
- 3 account type configurations
