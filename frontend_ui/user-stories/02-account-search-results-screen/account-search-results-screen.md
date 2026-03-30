# Account Search Results Screen

## Scenario: Account Search Results Display

---

## Business Use Case:
Displays paginated results from account search query, showing key account information in scannable format. Users can quickly review multiple accounts and select one for detailed view. Supports efficient customer service operations by providing at-a-glance account status, balance, and credit information.

---

## Goals:
- Display search results in user-friendly paginated format
- Show critical account information without overwhelming users
- Enable quick navigation to detailed account view
- Support pagination for large result sets
- Provide clear visual indicators for account status
- Allow users to refine search or start new search

---

## Business Flow:

### Phase 1: Results Page Load

**Endpoint:** /api/v1/accounts/search
**Method:** POST
**Trigger:** Automatic after search submission OR pagination button click

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
  }
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| searchCriteria | object | Original search parameters | Yes | Previous screen |
| page | number | Current page number | Yes | Pagination control |
| pageSize | number | Records per page | Yes | System default (20) |

**Validations:**
- Search criteria must match original search
- Page number must be within valid range (1 to totalPages)
- Page size must be between 1 and 100

**The System:**
- Preserves search criteria across pagination
- Shows loading indicator during page navigation
- Highlights selected account row on hover
- Calculates available credit (limit - balance)
- Formats currency with $ and 2 decimal places
- Disables Previous button on first page
- Disables Next button on last page

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
      "openDate": "2022-03-15"
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
| results | array | Account records for current page |
| accountStatus | string | ACTIVE or INACTIVE |
| currentBalance | decimal | Negative = amount owed |
| creditLimit | decimal | Maximum credit allowed |
| availableCredit | decimal | Calculated: limit - abs(balance) |
| totalRecords | number | Total matching accounts |
| currentPage | number | Current page number |
| totalPages | number | Total pages available |

**Validations:**
- Results array length must not exceed pageSize
- Available credit calculation: creditLimit - abs(currentBalance)
- Inactive accounts displayed with different styling

### Response Processing:

**Valid Response / Complete Response:**
- Display each account in card format with:
  - Account ID (first line, bold)
  - Customer name • Status indicator
  - Balance (red if negative, green if positive)
  - Credit limit and available credit
- Show result count: "Search Results (45 accounts)"
- Display current page indicator: "Page 1 of 3"
- Enable clickable account rows (navigate to detail on click)
- Enable/disable pagination buttons based on hasNextPage/hasPreviousPage
- Highlight INACTIVE accounts with gray background
- Log page view for analytics

**Error Response / Incomplete Response:**
- **404 Not Found - No Results:**
  - Display empty state: "No accounts found"
  - Show "Try a different search" message
  - Provide "Back to Search" button

- **400 Bad Request - Invalid Page:**
  - Display: "Invalid page number"
  - Reset to page 1
  - Re-execute search

- **500 Server Error:**
  - Display: "Unable to load results. Please try again."
  - Show retry button
  - Preserve search criteria for retry

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| searchResults | array | [] | API response |
| currentPage | number | 1 | Pagination button click |
| totalPages | number | 0 | API response |
| totalRecords | number | 0 | API response |
| isLoading | boolean | false | Page navigation |
| selectedAccountId | string | null | Account row click |
| searchCriteria | object | {} | Previous screen |

---

## Edge Case Scenarios:

* **Account Status Changed**
  * When it happens: Account activated/deactivated after search
  * System behavior: Display stale data indicator, show refresh button

* **Navigate Back from Detail**
  * When it happens: User returns from account detail view
  * System behavior: Preserve page number and scroll position, don't re-execute search

* **Empty Result Page**
  * When it happens: All results on current page deleted
  * System behavior: Auto-navigate to previous page or page 1

* **Click Account Row**
  * When it happens: User clicks any part of account card
  * System behavior: Navigate to account detail view with account ID parameter