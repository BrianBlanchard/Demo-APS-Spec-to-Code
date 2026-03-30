# Transaction Entry Screen

## Scenario: Manual Transaction Entry

---

## Business Use Case:
Enables authorized users to manually enter credit card transactions into the system. Supports multiple transaction types including purchases, cash advances, payments, fees, interest charges, and adjustments. Used for POS transactions, phone orders, manual adjustments, and batch transaction processing. Critical for transaction processing operations and account maintenance.

---

## Goals:
- Provide intuitive interface for manual transaction entry
- Support all transaction types defined in business rules
- Validate card status and available credit before processing
- Capture complete merchant information for purchases
- Generate unique sequential transaction IDs
- Log all transaction attempts for audit and compliance

---

## Business Flow:

### Phase 1: Transaction Validation and Submission

**Endpoint:** /api/v1/transactions
**Method:** POST
**Trigger:** User clicks "Submit Transaction" button

### Request Object:
```json
{
  "cardNumber": "4532123456789012",
  "transactionType": "01",
  "transactionCategory": "0001",
  "amount": 125.50,
  "merchantInfo": {
    "merchantId": "MERCH12345",
    "merchantName": "Best Buy Store #1234",
    "merchantCity": "Los Angeles",
    "merchantZip": "90001"
  },
  "description": "Electronics purchase",
  "source": "POS",
  "timestamp": "2024-01-15T14:35:00Z"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| cardNumber | string(16) | 16-digit card number | Yes | User input |
| transactionType | string(2) | Transaction type code | Yes | Dropdown selection |
| transactionCategory | string(4) | Category code (4 digits) | Yes | Auto-mapped from type |
| amount | decimal | Transaction amount | Yes | User input |
| merchantId | string(10) | Merchant identifier | Conditional | User input/lookup |
| merchantName | string(100) | Merchant business name | Conditional | User input |
| merchantCity | string(50) | Merchant city | Conditional | User input |
| merchantZip | string(10) | Merchant ZIP code | Conditional | User input |
| description | string(100) | Transaction description | Yes | User input/auto-generated |
| source | string(10) | Transaction source | Yes | System/user selection |
| timestamp | ISO8601 | Transaction timestamp | Yes | System generated |

**Transaction Type Mapping:**
| Type Code | Type Name | Category Code | Merchant Required |
|:---------:|:---------:|:-------------:|:-----------------:|
| 01 | Purchase | 0001 | Yes |
| 02 | Payment | 0002 | No |
| 03 | Cash Advance | 0003 | No |
| 04 | Fee | 0004 | No |
| 05 | Interest | 0005 | No |
| 06 | Adjustment | 0006 | No |

**Validations:**
- Card number must be exactly 16 digits
- Card must exist in system and be ACTIVE
- Card must not be expired (expiration date >= current date)
- Account associated with card must be ACTIVE
- Amount must be > 0 and <= 999999.99
- For purchases/cash advances: Amount <= available credit
- Merchant information required for Purchase transactions
- Transaction description max 100 characters

**The System:**
- Shows loading indicator during validation and submission
- Validates card number format in real-time (Luhn algorithm)
- Looks up card details after 16 digits entered
- Displays card holder name and available credit after lookup
- Auto-formats amount with 2 decimal places
- Conditionally shows/hides merchant fields based on transaction type
- Disables submit button until all required fields valid
- Generates sequential transaction ID on server side

### Response Object:
```json
{
  "success": true,
  "transactionId": "1234567890123456",
  "status": "APPROVED",
  "message": "Transaction processed successfully",
  "transaction": {
    "transactionId": "1234567890123456",
    "cardNumber": "4532123456789012",
    "amount": 125.50,
    "transactionType": "01",
    "transactionCategory": "0001",
    "timestamp": "2024-01-15T14:35:00Z",
    "merchantName": "Best Buy Store #1234"
  },
  "account": {
    "accountId": "12345678901",
    "previousBalance": -2450.75,
    "newBalance": -2576.25,
    "availableCredit": 7423.75
  },
  "authorizationCode": "AUTH123456"
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| success | boolean | Transaction result |
| transactionId | string(16) | Unique transaction identifier |
| status | string | APPROVED, DECLINED, ERROR |
| message | string | Result message |
| previousBalance | decimal | Balance before transaction |
| newBalance | decimal | Balance after transaction |
| availableCredit | decimal | Remaining credit after posting |
| authorizationCode | string | Authorization code for approved txn |

**Validations:**
- Transaction ID must be unique and sequential
- New balance must equal previous balance +/- amount (based on type)
- Available credit must be recalculated correctly

### Response Processing:

**Valid Response / Complete Response:**
- Display success message: "Transaction APPROVED"
- Show transaction confirmation with:
  - Transaction ID (bold, large)
  - Amount
  - Card number (last 4 digits only: ****9012)
  - Merchant name
  - Authorization code
  - New account balance
  - Available credit
- Navigate to transaction confirmation screen
- Clear form for next transaction
- Log successful transaction
- Offer "Print Receipt" option

**Error Response / Incomplete Response:**
- **402 Payment Required - Insufficient Credit:**
  - Display: "DECLINED - Insufficient credit"
  - Show: "Available: $7,549.25 | Requested: $8,000.00"
  - Suggest: "Maximum amount allowed: $7,549.25"
  - Log declined transaction with reason code
  - Do NOT update account balance

- **404 Not Found - Card Not Found:**
  - Display: "Card number not found. Please verify and try again."
  - Highlight card number field in red
  - Clear card number field
  - Focus card number input

- **403 Forbidden - Card Inactive:**
  - Display: "DECLINED - Card is inactive"
  - Show card status and reason
  - Log declined attempt
  - Suggest contacting card services

- **410 Gone - Card Expired:**
  - Display: "DECLINED - Card expired on {expiration_date}"
  - Show card expiration date
  - Suggest issuing replacement card
  - Log expired card usage attempt

- **422 Unprocessable - Validation Error:**
  - Display specific validation errors:
    - "Amount exceeds maximum transaction limit"
    - "Merchant information required for purchase transactions"
    - "Invalid card number format"
  - Highlight invalid fields
  - Keep all entered data for correction

- **409 Conflict - Duplicate Transaction:**
  - Display: "Possible duplicate transaction detected"
  - Show similar recent transaction details
  - Ask: "Proceed anyway?" with Yes/No buttons
  - Require explicit confirmation to override

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| cardNumber | string | "" | Input onChange (numeric only) |
| transactionType | string | "01" | Dropdown selection |
| amount | number | 0 | Input onChange (currency format) |
| merchantName | string | "" | Input onChange |
| merchantCity | string | "" | Input onChange |
| merchantZip | string | "" | Input onChange |
| description | string | "" | Input onChange / auto-generated |
| cardDetails | object | null | Card lookup API |
| availableCredit | number | 0 | Card lookup API |
| isSubmitting | boolean | false | Submit button / API response |
| validationErrors | object | {} | Client/server validation |
| showMerchantFields | boolean | true | Transaction type change |

---

## Edge Case Scenarios:

* **Card Lookup After 16 Digits**
  * When it happens: User enters 16th digit of card number
  * System behavior: Auto-trigger card lookup API, display card holder and available credit, validate card status

* **Duplicate Transaction Detection**
  * When it happens: Same card, amount, merchant within 2 minutes
  * System behavior: Show warning "Similar transaction submitted 45 seconds ago. Continue?", require confirmation

* **Over-Limit Transaction Approval**
  * When it happens: Transaction exceeds available credit but within over-limit policy
  * System behavior: Show "Over-limit fee $35 will apply. Proceed?", require explicit approval

* **Network Timeout During Processing**
  * When it happens: API timeout after 10 seconds
  * System behavior: Display "Transaction status unknown. Checking...", poll status endpoint, show final result or manual verification option

* **Transaction Type Change**
  * When it happens: User changes type from Purchase to Payment
  * System behavior: Hide merchant fields, show payment source field, update category code, change submit button color