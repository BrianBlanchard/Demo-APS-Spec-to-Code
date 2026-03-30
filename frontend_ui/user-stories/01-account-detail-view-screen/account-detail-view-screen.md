# Account Detail View Screen

## Scenario: Detailed Account Information Display

---

## Business Use Case:
Provides comprehensive view of individual credit card account including all account metadata, financial information, status, and associated customer details. Serves as central hub for account-related operations including updates, card management, and transaction history access. Critical for customer service representatives handling inquiries and administrators managing accounts.

---

## Goals:
- Display complete account information in organized layout
- Show real-time account balances and credit limits
- Provide access to related functions (update, cards, transactions)
- Display account status with clear visual indicators
- Enable navigation to associated records (customer, cards)
- Track all account access for compliance and audit

---

## Business Flow:

### Phase 1: Account Detail Retrieval

**Endpoint:** /api/v1/accounts/{accountId}
**Method:** GET
**Trigger:** Page load when navigating to account detail

### Request Object:
```json
{
  "accountId": "12345678901",
  "includeCustomer": true,
  "includeCardCount": true
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| accountId | string(11) | Account identifier | Yes | URL parameter |
| includeCustomer | boolean | Include customer details | Yes | Default true |
| includeCardCount | boolean | Include card count | Yes | Default true |

**Validations:**
- Account ID must be exactly 11 digits
- Account must exist in system
- User must have permission to view account

**The System:**
- Shows loading skeleton while fetching data
- Validates user permissions for account access
- Formats all currency values with $ and 2 decimals
- Formats dates as MM/DD/YYYY
- Calculates available credit dynamically
- Logs account view event with user ID and timestamp

### Response Object:
```json
{
  "account": {
    "accountId": "12345678901",
    "accountStatus": "ACTIVE",
    "currentBalance": -2450.75,
    "creditLimit": 10000.00,
    "cashCreditLimit": 2000.00,
    "availableCredit": 7549.25,
    "openDate": "2022-03-15",
    "expirationDate": "2026-03-31",
    "reissueDate": "2025-12-01",
    "currentCycleCredit": 500.00,
    "currentCycleDebit": 1250.75,
    "accountGroupId": "GRP001",
    "zipCode": "90210"
  },
  "customer": {
    "customerId": "123456789",
    "firstName": "John",
    "middleName": "Robert",
    "lastName": "Smith",
    "ficoScore": 725
  },
  "cardCount": 2,
  "lastTransactionDate": "2024-01-10"
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| accountId | string(11) | Unique account identifier |
| accountStatus | string | ACTIVE or INACTIVE |
| currentBalance | decimal | Current balance (negative = owed) |
| creditLimit | decimal | Maximum credit limit |
| cashCreditLimit | decimal | Maximum cash advance limit |
| availableCredit | decimal | Remaining available credit |
| openDate | date | Account opening date |
| expirationDate | date | Account expiration date |
| reissueDate | date | Next card reissue date |
| currentCycleCredit | decimal | Credits in current billing cycle |
| currentCycleDebit | decimal | Debits in current billing cycle |
| accountGroupId | string | Account group identifier |
| zipCode | string | Associated ZIP code |
| ficoScore | number | Customer FICO score (300-850) |
| cardCount | number | Number of cards issued |

**Validations:**
- Available credit = creditLimit - abs(currentBalance)
- FICO score must be between 300 and 850
- All dates must be valid ISO format
- Status must be ACTIVE or INACTIVE

### Response Processing:

**Valid Response / Complete Response:**
- Display account information section:
  - Account ID (bold, large text)
  - Customer name with customer ID in parentheses
  - Status badge (green for ACTIVE, red for INACTIVE)
  - Open date, expiration date formatted as MM/DD/YYYY
- Display financial summary card:
  - Current balance (red if negative, green if positive)
  - Credit limit
  - Available credit (calculated)
  - Cash credit limit
- Enable action buttons:
  - "Update Account" (if user has update permission)
  - "View Cards" (shows card count badge if > 0)
  - "Transaction History"
- Display last transaction date if available
- Log account view event for audit

**Error Response / Incomplete Response:**
- **404 Not Found - Account Not Found:**
  - Display: "Account not found. It may have been deleted."
  - Show "Back to Search" button
  - Log error with account ID

- **403 Forbidden - Insufficient Permissions:**
  - Display: "You do not have permission to view this account."
  - Hide sensitive information (balance, limits)
  - Log unauthorized access attempt
  - Show help desk contact

- **410 Gone - Account Archived:**
  - Display: "This account has been archived and is read-only."
  - Disable Update button
  - Show archive date and reason

- **500 Server Error:**
  - Display: "Unable to load account details. Please try again."
  - Show retry button
  - Enable back navigation

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| accountData | object | null | API response |
| customerData | object | null | API response |
| isLoading | boolean | true | Page load / API response |
| hasUpdatePermission | boolean | false | Permission check |
| cardCount | number | 0 | API response |
| error | string | null | API error |

---

## Edge Case Scenarios:

* **Account Recently Updated**
  * When it happens: Account modified by another user
  * System behavior: Show "Data may have changed" banner, provide refresh button

* **Expired Account**
  * When it happens: Current date > expiration date
  * System behavior: Show warning banner "Account expired", highlight expiration date in red

* **Over Credit Limit**
  * When it happens: abs(currentBalance) > creditLimit
  * System behavior: Show warning icon, highlight in red, display "Over limit by $XXX.XX"

* **No Associated Cards**
  * When it happens: cardCount = 0
  * System behavior: "View Cards" button shows "No cards issued", suggest "Issue New Card"

* **Customer Info Unavailable**
  * When it happens: Customer record deleted or inaccessible
  * System behavior: Show customer ID only with note "Details unavailable"