# Transaction Confirmation Screen

## Scenario: Transaction Approval Confirmation

---

## Business Use Case:
Displays successful transaction approval with complete transaction details and receipt information. Serves as proof of transaction completion for customer service and merchant interactions. Provides transaction ID for reference and dispute resolution. Critical for transaction reconciliation and customer service documentation.

---

## Goals:
- Confirm successful transaction processing
- Display complete transaction details for record-keeping
- Provide transaction ID for future reference
- Show updated account balance and available credit
- Enable receipt printing for customer records
- Allow quick entry of new transaction

---

## Business Flow:

### Phase 1: Confirmation Display

**Endpoint:** /api/v1/transactions/{transactionId}
**Method:** GET
**Trigger:** Automatic redirect after successful transaction processing

### Request Object:
```json
{
  "transactionId": "1234567890123456"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| transactionId | string(16) | Transaction identifier | Yes | Previous screen |

**Validations:**
- Transaction ID must be valid 16-digit sequence
- Transaction must exist in system

**The System:**
- Auto-loads transaction details on page render
- Displays large visual success indicator (green checkmark)
- Formats all monetary values with $ and 2 decimals
- Masks card number (shows last 4 digits only)
- Formats timestamp in user-friendly format
- Pre-generates receipt for print option

### Response Object:
```json
{
  "transaction": {
    "transactionId": "1234567890123456",
    "cardNumber": "4532123456789012",
    "cardNumberMasked": "****9012",
    "amount": 125.50,
    "transactionType": "01",
    "transactionTypeDescription": "Purchase",
    "merchantName": "Best Buy Store #1234",
    "merchantCity": "Los Angeles",
    "merchantZip": "90001",
    "authorizationCode": "AUTH123456",
    "timestamp": "2024-01-15T14:35:00Z",
    "status": "APPROVED"
  },
  "account": {
    "accountId": "12345678901",
    "newBalance": -2576.25,
    "availableCredit": 7423.75,
    "creditLimit": 10000.00
  },
  "receipt": {
    "receiptId": "RCPT789012",
    "printUrl": "/api/v1/receipts/RCPT789012/print"
  }
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| transactionId | string(16) | Unique transaction ID |
| cardNumberMasked | string | Masked card number (last 4) |
| amount | decimal | Transaction amount |
| transactionTypeDescription | string | Human-readable type |
| merchantName | string | Merchant business name |
| authorizationCode | string | Authorization code |
| timestamp | ISO8601 | Transaction date/time |
| newBalance | decimal | Updated account balance |
| availableCredit | decimal | Remaining credit |
| receiptId | string | Receipt identifier |
| printUrl | string | Receipt print endpoint |

**Validations:**
- All transaction details must match submitted data
- Balance calculation verified: previous + amount = new

### Response Processing:

**Valid Response / Complete Response:**
- Display large green checkmark icon
- Show "APPROVED" status in green bold text
- Display transaction details card:
  - Transaction ID (full 16 digits)
  - Masked card number (****9012)
  - Amount formatted as currency ($125.50)
  - Merchant name
  - Authorization code
  - Date and time formatted (MM/DD/YYYY HH:MM AM/PM)
- Show updated financial information:
  - New balance in red (if negative)
  - Available credit in gray
- Enable "Print Receipt" button
- Enable "New Transaction" button
- Auto-focus "New Transaction" for keyboard workflow

**Error Response / Incomplete Response:**
- **404 Not Found - Transaction Not Found:**
  - Display: "Transaction details not found"
  - Show generic success message without details
  - Disable print receipt option
  - Log error for investigation

- **500 Server Error:**
  - Display: "Transaction approved but confirmation details unavailable"
  - Show transaction ID only
  - Suggest checking transaction history
  - Enable retry to reload details

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| transactionData | object | null | API response |
| accountData | object | null | API response |
| isLoading | boolean | true | Page load / API response |
| receiptUrl | string | null | API response |

---

## Edge Case Scenarios:

* **Print Receipt Action**
  * When it happens: User clicks "Print Receipt" button
  * System behavior: Open print dialog with formatted receipt, include transaction details, merchant info, card holder name

* **New Transaction Quick Entry**
  * When it happens: User clicks "New Transaction"
  * System behavior: Navigate to transaction entry screen, clear previous data, focus card number field

* **Transaction Reversal Needed**
  * When it happens: Error discovered after approval
  * System behavior: Show "Contact administrator for reversal" message, provide transaction ID for reference

* **Email Receipt Option**
  * When it happens: User wants electronic receipt
  * System behavior: Show email input, send receipt to provided email, confirm send