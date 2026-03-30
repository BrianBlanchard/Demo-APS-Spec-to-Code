# Payment Review Screen

## Scenario: Payment Review and Confirmation

---

## Business Use Case:
Final confirmation step before payment processing. Displays complete payment details for user review including account, amount, payment method, and resulting balance. Requires explicit user authorization via checkbox before submission. Implements security and compliance requirements for financial transactions. Critical for preventing erroneous payments and ensuring user consent.

---

## Goals:
- Display complete payment details for final review
- Show calculated new balance after payment
- Require explicit user authorization before processing
- Prevent duplicate payment submissions
- Generate confirmation immediately upon successful processing
- Send notification of payment to account holder

---

## Business Flow:

### Phase 1: Payment Processing

**Endpoint:** /api/v1/payments/process
**Method:** POST
**Trigger:** User clicks "Submit Payment" button

### Request Object:
```json
{
  "accountId": "12345678901",
  "amount": 2450.75,
  "paymentMethod": "EFT",
  "eftAccountId": "EFT123456",
  "paymentType": "FULL",
  "userAuthorized": true,
  "userId": "USR12345",
  "timestamp": "2024-01-15T15:00:00Z"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| accountId | string(11) | Account to receive payment | Yes | Previous screens |
| amount | decimal | Payment amount | Yes | Previous screen |
| paymentMethod | string | EFT, CHECK, CASH | Yes | Previous screen |
| eftAccountId | string | EFT account ID | Conditional | Payment method |
| paymentType | string | MINIMUM, FULL, CUSTOM | Yes | Previous screen |
| userAuthorized | boolean | User checkbox confirmation | Yes | Checkbox state |
| userId | string(8) | User making payment | Yes | Session |
| timestamp | ISO8601 | Payment submission time | Yes | System |

**Validations:**
- User authorization must be true (checkbox checked)
- Account must still exist and be ACTIVE
- Amount must still be valid against current balance
- Payment method must still be available
- Duplicate payment check (same account/amount within 5 minutes)
- EFT account must be verified if EFT method

**The System:**
- Shows loading indicator on submit button
- Disables submit button during processing
- Displays processing overlay "Processing payment..."
- Creates transaction record with type code '02' (payment)
- Updates account balance atomically
- Records transaction with category code 2
- Generates unique transaction ID
- Creates audit trail entry
- Triggers payment confirmation notification

### Response Object:
```json
{
  "success": true,
  "transactionId": "9876543210987654",
  "message": "Payment processed successfully",
  "payment": {
    "paymentId": "PAY123456789",
    "transactionId": "9876543210987654",
    "accountId": "12345678901",
    "amount": 2450.75,
    "paymentMethod": "EFT",
    "processingDate": "2024-01-16",
    "postingDate": "2024-01-16",
    "confirmationNumber": "CONF789012"
  },
  "account": {
    "accountId": "12345678901",
    "previousBalance": -2450.75,
    "paymentAmount": 2450.75,
    "newBalance": 0.00,
    "availableCredit": 10000.00
  },
  "notification": {
    "sent": true,
    "method": "email",
    "recipient": "john.smith@email.com"
  }
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| success | boolean | Payment processing result |
| transactionId | string(16) | Transaction record ID |
| paymentId | string | Unique payment identifier |
| confirmationNumber | string | Payment confirmation code |
| processingDate | date | Date payment processed |
| postingDate | date | Date payment posts to account |
| previousBalance | decimal | Balance before payment |
| paymentAmount | decimal | Payment amount |
| newBalance | decimal | Balance after payment |
| availableCredit | decimal | Updated available credit |
| notificationSent | boolean | Confirmation email sent |

**Validations:**
- Transaction ID must be unique and sequential
- New balance = previous balance + payment amount
- Available credit updated correctly
- Payment transaction created with type '02', category 2
- Confirmation number generated for reference

### Response Processing:

**Valid Response / Complete Response:**
- Navigate to payment confirmation screen
- Display success message: "Payment Processed Successfully"
- Show confirmation details:
  - Confirmation number (large, bold)
  - Transaction ID
  - Payment amount
  - Processing date
  - New account balance
  - Available credit
- Offer "Print Confirmation" option
- Offer "Email Confirmation" option
- Display "Make Another Payment" button
- Log successful payment event
- Clear sensitive payment data from memory

**Error Response / Incomplete Response:**
- **402 Payment Required - Insufficient Funds:**
  - Display: "Payment failed - Insufficient funds in bank account"
  - Show EFT account details
  - Suggest: "Try different payment method or smaller amount"
  - Return to amount selection screen

- **409 Conflict - Duplicate Payment:**
  - Display: "Duplicate payment detected"
  - Show: "Similar payment submitted 2 minutes ago (Transaction ID: XXXX)"
  - Ask: "View recent payment?" with Yes/No
  - Log duplicate attempt

- **422 Unprocessable - Balance Changed:**
  - Display: "Account balance has changed since review"
  - Show: "Previous: $2,450.75 | Current: $2,575.50"
  - Ask: "Recalculate payment?" with Update/Cancel options
  - Return to amount selection with updated balance

- **428 Precondition Required - Authorization Missing:**
  - Display: "Please check the authorization box to proceed"
  - Highlight checkbox in red
  - Focus checkbox element

- **500 Server Error:**
  - Display: "Payment processing error. Your payment was NOT processed."
  - Show: "No charges have been made to your account"
  - Offer retry option
  - Log error with all request details
  - Provide reference number for support

- **504 Gateway Timeout:**
  - Display: "Payment processing timeout. Checking status..."
  - Poll payment status endpoint
  - Show final result when available
  - If unknown: "Payment status uncertain. Contact support with reference: REF123456"

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| paymentDetails | object | {} | Previous screen |
| isAuthorized | boolean | false | Checkbox onChange |
| isSubmitting | boolean | false | Submit button / API |
| newBalance | number | 0 | Calculated: current + payment |
| availableCredit | number | 0 | Calculated: limit - newBalance |

---

## Edge Case Scenarios:

* **Duplicate Payment Prevention**
  * When it happens: Same account/amount within 5 minutes
  * System behavior: Block submission, show "Similar payment already processed", display recent payment details

* **Network Timeout During Processing**
  * When it happens: API timeout after 30 seconds
  * System behavior: Show "Verifying payment status...", poll status endpoint every 5s for 2 minutes, show final result or manual verification instructions

* **Authorization Checkbox Validation**
  * When it happens: User clicks submit without checking box
  * System behavior: Prevent submission, shake checkbox, show error "Authorization required"

* **Balance Changed Warning**
  * When it happens: New transaction posted after review screen loaded
  * System behavior: Detect on submit, show "Balance changed to $X,XXX.XX. Proceed with payment?"

* **Session Timeout**
  * When it happens: User idle on review screen > 10 minutes
  * System behavior: Show "Session timeout. For security, please restart payment.", redirect to account selection