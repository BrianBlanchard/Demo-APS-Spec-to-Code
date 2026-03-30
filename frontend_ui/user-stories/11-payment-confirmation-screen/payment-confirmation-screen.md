# Payment Confirmation Screen

## Scenario: Payment Confirmation Display

---

## Business Use Case:
Displays successful payment confirmation with complete receipt details. Serves as proof of payment for customer records and provides confirmation number for future reference. Critical for customer satisfaction and payment tracking. Enables easy access to receipt printing and payment history.

---

## Goals:
- Confirm successful payment processing
- Provide confirmation number for record-keeping
- Display complete payment details and receipt
- Show updated account balance after payment
- Enable receipt printing for customer records
- Confirm notification delivery to customer email
- Facilitate additional payments or history review

---

## Business Flow:

### Phase 1: Confirmation Display

**Endpoint:** /api/v1/payments/{paymentId}/confirmation
**Method:** GET
**Trigger:** Automatic navigation after successful payment processing

### Request Object:
```json
{
  "paymentId": "PAY123456789",
  "includeReceipt": true
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| paymentId | string | Unique payment identifier | Yes | Previous screen |
| includeReceipt | boolean | Include receipt data | Yes | Default true |

**Validations:**
- Payment ID must be valid
- Payment must be successfully processed

**The System:**
- Auto-loads payment confirmation on render
- Displays large green success indicator
- Formats all currency values with $ and 2 decimals
- Masks account number for security
- Shows confirmation email delivery status
- Pre-generates receipt for print option

### Response Object:
```json
{
  "payment": {
    "paymentId": "PAY123456789",
    "confirmationNumber": "CONF789012",
    "transactionId": "9876543210987654",
    "accountId": "12345678901",
    "amount": 2450.75,
    "paymentMethod": "Electronic Transfer",
    "eftAccountLast4": "1234",
    "processingDate": "2024-01-16",
    "postingDate": "2024-01-16",
    "status": "COMPLETED"
  },
  "account": {
    "previousBalance": -2450.75,
    "paymentAmount": 2450.75,
    "newBalance": 0.00,
    "availableCredit": 10000.00
  },
  "notification": {
    "sent": true,
    "method": "email",
    "recipient": "john.smith@email.com",
    "sentAt": "2024-01-15T15:00:30Z"
  },
  "receipt": {
    "receiptId": "RCPT456789",
    "printUrl": "/api/v1/receipts/RCPT456789/print"
  }
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| paymentId | string | Payment identifier |
| confirmationNumber | string | Confirmation code for reference |
| transactionId | string(16) | Associated transaction ID |
| accountId | string(11) | Account that received payment |
| amount | decimal | Payment amount |
| paymentMethod | string | Payment method used |
| eftAccountLast4 | string(4) | Last 4 of bank account |
| processingDate | date | Date payment processed |
| postingDate | date | Date payment posted to account |
| status | string | COMPLETED, PENDING, FAILED |
| previousBalance | decimal | Balance before payment |
| newBalance | decimal | Balance after payment |
| notificationSent | boolean | Email sent successfully |
| recipient | string | Email recipient address |
| receiptId | string | Receipt document ID |
| printUrl | string | Receipt print endpoint |

**Validations:**
- New balance calculation verified
- Confirmation number unique per payment
- Notification delivery confirmed

### Response Processing:

**Valid Response / Complete Response:**
- Display large green checkmark icon
- Show "Payment Successful" heading
- Display confirmation card with:
  - Confirmation number (bold, large)
  - Transaction ID
  - Account ID (masked)
  - Payment amount
  - Payment method with account last 4
  - Processing date
  - New balance ($0.00 in green if zero)
- Show email confirmation status
- Enable "Print Receipt" button
- Enable "Make Another Payment" button
- Enable "View Payment History" button
- Log confirmation view event

**Error Response / Incomplete Response:**
- **404 Not Found:**
  - Display: "Payment confirmation not found"
  - Show generic success message
  - Disable receipt print

- **500 Server Error:**
  - Display: "Payment successful but unable to load details"
  - Show payment ID only
  - Enable retry to reload

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| paymentData | object | null | API response |
| accountData | object | null | API response |
| notificationStatus | object | null | API response |
| isLoading | boolean | true | Page load / API |
| receiptUrl | string | null | API response |

---

## Edge Case Scenarios:

* **Print Receipt Action**
  * When it happens: User clicks "Print Receipt"
  * System behavior: Open print dialog with formatted receipt including all payment details, account info, timestamp

* **Email Delivery Failure**
  * When it happens: Notification send failed
  * System behavior: Show warning icon, "Email delivery failed", offer "Resend Email" button

* **Make Another Payment**
  * When it happens: User clicks "Make Another Payment"
  * System behavior: Navigate to account selection screen, clear previous payment data

* **View Payment History**
  * When it happens: User clicks history button
  * System behavior: Navigate to payment history screen with account filter pre-applied