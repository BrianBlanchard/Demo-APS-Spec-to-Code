# Account Search Screen

## Scenario: Account Search and Retrieval

---

## Business Use Case:
Provides administrators and customer service representatives with the ability to locate credit card accounts using various search criteria. Supports searches by Account ID, Customer ID, or account status. Critical for customer service operations, account inquiries, and administrative tasks. Search results are paginated for performance when large result sets are returned.

---

## Goals:
- Enable quick account lookup using multiple search criteria
- Support partial matches for customer service scenarios
- Display paginated results for large datasets
- Provide account summary information in results
- Enable drill-down to detailed account view
- Track all account access for audit compliance

---

## Business Flow:

### Phase 1: Account Search Request

**Endpoint:** /api/v1/accounts/search
**Method:** POST
**Trigger:** User clicks "Search Accounts" button

### Request Object:
```json
{
  "searchCriteria": {
    "accountId": "12345678901",
    "customerId": "123456789",
    "accountStatus": "ACTIVE"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  },
  "sortBy": "accountId",
  "sortOrder": "ASC"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| accountId | string(11) | 11-digit account identifier | No | User input |
| customerId | string(9) | 9-digit customer identifier | No | User input |
| accountStatus | string | ACTIVE or INACTIVE | No | User selection |
| page | number | Page number for pagination | Yes | Default 1 |
| pageSize | number | Records per page | Yes | Default 20 |
| sortBy | string | Sort field name | Yes | Default accountId |
| sortOrder | string | ASC or DESC | Yes | Default ASC |

**Validations:**
- At least one search criterion must be provided
- Account ID must be 11 digits if provided
- Customer ID must be 9 digits if provided
- Account Status must be ACTIVE or INACTIVE if provided
- Page size cannot exceed 100 records

**The System:**
- Shows loading indicator during search
- Disables search button during API call
- Validates input formats before submission
- Allows partial matching on Account ID and Customer ID
- Logs search queries for audit trail

### Response Object:
```json
{
  "results": [
    {
      "accountId": "12345678901",
      "customerId": "123456789",
      "customerName": "John Smith",
      "accountStatus": "ACTIVE",
      "currentBalance": -2450.75,
      "creditLimit": 10000.00,
      "availableCredit": 7549.25,
      "openDate": "2022-03-15",
      "lastActivityDate": "2024-01-10"
    }
  ],
  "pagination": {
    "totalRecords": 45,
    "currentPage": 1,
    "totalPages": 3,
    "pageSize": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| results | array | Array of matching account records |
| accountId | string(11) | Account identifier |
| customerId | string(9) | Associated customer ID |
| customerName | string | Customer full name |
| accountStatus | string | ACTIVE or INACTIVE |
| currentBalance | decimal | Current account balance (negative = owed) |
| creditLimit | decimal | Maximum credit limit |
| availableCredit | decimal | Remaining available credit |
| openDate | date | Account opening date |
| lastActivityDate | date | Most recent transaction date |
| totalRecords | number | Total matching records |
| totalPages | number | Total pages available |

**Validations:**
- Results must be displayed in specified sort order
- Balance amounts must display with 2 decimal precision
- Dates must be formatted consistently (YYYY-MM-DD)

### Response Processing:

**Valid Response / Complete Response:**
- Display results in paginated table format
- Show account summary: ID, customer name, status, balance, credit limit
- Display balance in red if negative (amount owed)
- Show "Available Credit" calculation
- Enable click-through to detailed account view
- Display pagination controls (Previous/Next, page numbers)
- Show total record count: "Showing 1-20 of 45 results"
- Log successful search with result count

**Error Response / Incomplete Response:**
- **404 Not Found - No Results:**
  - Display: "No accounts found matching your search criteria."
  - Show "Clear Search" button to reset form
  - Suggest: "Try searching with different criteria"

- **400 Bad Request - Invalid Criteria:**
  - Display specific validation errors:
    - "Account ID must be 11 digits"
    - "Customer ID must be 9 digits"
    - "Please provide at least one search criterion"
  - Highlight fields with errors in red
  - Focus first invalid field

- **403 Forbidden - Insufficient Permissions:**
  - Display: "You do not have permission to search accounts. Contact administrator."
  - Log unauthorized access attempt
  - Show help desk contact info

- **500 Server Error:**
  - Display: "Search temporarily unavailable. Please try again."
  - Show retry button
  - Log error for investigation

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| accountId | string | "" | onChange handler |
| customerId | string | "" | onChange handler |
| accountStatus | string | "" | Radio button selection |
| searchResults | array | [] | API response |
| isSearching | boolean | false | Search button click / API response |
| currentPage | number | 1 | Pagination controls |
| totalPages | number | 0 | API response |
| sortBy | string | "accountId" | Column header click |
| sortOrder | string | "ASC" | Column header click |

---

## Edge Case Scenarios:

* **Large Result Set (> 1000 records)**
  * When it happens: Search criteria too broad
  * System behavior: Display warning "Too many results. Please refine search.", limit to first 1000 records

* **Special Characters in Search**
  * When it happens: User enters non-numeric characters in ID fields
  * System behavior: Auto-filter non-numeric input, show tooltip "Only numbers allowed"

* **Concurrent Account Updates**
  * When it happens: Account modified after search results displayed
  * System behavior: Show "Data may have changed" indicator, provide refresh button

* **Export Results**
  * When it happens: User wants to export search results
  * System behavior: Enable CSV export (max 1000 records), include all visible columns