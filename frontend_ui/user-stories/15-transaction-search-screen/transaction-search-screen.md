# Transaction Search Screen

## Scenario: Transaction History Search

---

## Business Use Case:
Enables users to search historical transactions using various criteria including date range, card number, transaction type, and amount. Critical for customer service inquiries, dispute resolution, account reconciliation, and reporting. Supports regulatory compliance requiring 7-year transaction history retention.

---

## Goals:
- Provide flexible search capabilities across transaction history
- Support multiple search criteria combinations
- Return paginated results for large datasets
- Enable drill-down to transaction details
- Support export for reporting and reconciliation
- Maintain search performance across millions of records

---

## Business Flow:

### Phase 1: Transaction Search Request

**Endpoint:** /api/v1/transactions/search
**Method:** POST
**Trigger:** User clicks "Search Transactions" button

### Request Object:
```json
{
  "searchCriteria": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31",
    "cardNumberLast4": "9012",
    "transactionType": "01",
    "amountMin": 100.00,
    "amountMax": 500.00
  },
  "pagination": {
    "page": 1,
    "pageSize": 50
  },
  "sortBy": "timestamp",
  "sortOrder": "DESC"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| dateFrom | date | Start date (YYYY-MM-DD) | No | Date picker |
| dateTo | date | End date (YYYY-MM-DD) | No | Date picker |
| cardNumberLast4 | string(4) | Last 4 digits of card | No | User input |
| transactionType | string(2) | Transaction type code | No | Dropdown |
| amountMin | decimal | Minimum amount | No | User input |
| amountMax | decimal | Maximum amount | No | User input |
| page | number | Page number | Yes | Default 1 |
| pageSize | number | Records per page | Yes | Default 50 |
| sortBy | string | Sort field | Yes | Default timestamp |
| sortOrder | string | ASC or DESC | Yes | Default DESC |

**Validations:**
- At least one search criterion must be provided
- Date range must not exceed 1 year
- dateTo must be >= dateFrom
- Card last 4 must be 4 digits if provided
- Amount range: min must be <= max
- Transaction type must be valid code if provided

**The System:**
- Shows loading indicator during search
- Validates date range before submission
- Auto-sets dateTo to today if not specified
- Formats amount inputs as currency
- Limits date range to prevent performance issues
- Suggests narrowing criteria if result count > 10,000

### Response Object:
```json
{
  "results": [
    {
      "transactionId": "1234567890123456",
      "cardNumber": "****9012",
      "accountId": "12345678901",
      "amount": 125.50,
      "transactionType": "01",
      "transactionTypeDescription": "Purchase",
      "merchantName": "Best Buy Store #1234",
      "timestamp": "2024-01-15T14:35:00Z",
      "status": "APPROVED"
    }
  ],
  "pagination": {
    "totalRecords": 234,
    "currentPage": 1,
    "totalPages": 5,
    "pageSize": 50
  },
  "summary": {
    "totalAmount": 15432.75,
    "averageAmount": 65.95,
    "transactionCount": 234
  }
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| results | array | Matching transaction records |
| transactionId | string(16) | Unique transaction ID |
| cardNumber | string | Masked card number |
| transactionTypeDescription | string | Human-readable type |
| timestamp | ISO8601 | Transaction date/time |
| status | string | APPROVED, DECLINED, REVERSED |
| totalRecords | number | Total matching transactions |
| totalAmount | decimal | Sum of all transaction amounts |
| averageAmount | decimal | Average transaction amount |

**Validations:**
- Results sorted by specified field and order
- Summary calculations verified for accuracy

### Response Processing:

**Valid Response / Complete Response:**
- Display search summary: "Found 234 transactions totaling $15,432.75"
- Show paginated results in table format:
  - Date/Time
  - Transaction ID
  - Card (last 4)
  - Type
  - Merchant/Description
  - Amount
  - Status badge
- Enable sorting by column headers
- Display pagination controls
- Show export button for results
- Enable click-through to transaction details
- Log search query for analytics

**Error Response / Incomplete Response:**
- **404 Not Found - No Results:**
  - Display: "No transactions found matching your criteria"
  - Show "Clear Filters" button
  - Suggest: "Try expanding date range or removing filters"

- **400 Bad Request - Invalid Criteria:**
  - Display specific validation errors:
    - "Date range cannot exceed 1 year"
    - "End date must be after start date"
    - "Invalid card number format"
  - Highlight invalid fields
  - Keep valid criteria for correction

- **413 Payload Too Large - Too Many Results:**
  - Display: "Search returned over 10,000 results. Please narrow your criteria."
  - Show result count without data
  - Suggest adding more filters

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| dateFrom | string | 30 days ago | Date picker |
| dateTo | string | today | Date picker |
| cardLast4 | string | "" | Input onChange |
| transactionType | string | "" | Dropdown selection |
| amountMin | number | null | Input onChange |
| amountMax | number | null | Input onChange |
| searchResults | array | [] | API response |
| isSearching | boolean | false | Search button / API |
| currentPage | number | 1 | Pagination |
| totalPages | number | 0 | API response |
| summary | object | {} | API response |

---

## Edge Case Scenarios:

* **Large Date Range Warning**
  * When it happens: Date range > 6 months
  * System behavior: Show warning "Large date range may result in slow search. Continue?"

* **Export Results**
  * When it happens: User clicks export button
  * System behavior: Generate CSV with all matching records (max 10,000), include all visible columns

* **Reversed Transaction Display**
  * When it happens: Transaction has been reversed
  * System behavior: Show strikethrough on amount, display "REVERSED" badge, link to reversal transaction