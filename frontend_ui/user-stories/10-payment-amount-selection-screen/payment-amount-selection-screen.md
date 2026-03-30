# Payment Amount Selection Screen

## Scenario: Payment Amount and Method Selection

---

## Business Use Case:
Allows users to select payment amount (minimum, full balance, or custom) and payment method (electronic transfer, check, cash). Implements business rules for minimum payment calculation (2% of balance, minimum $25) and validates custom amounts. Critical step in payment processing flow ensuring users understand payment options and consequences.

---

## Goals:
- Present clear payment amount options with calculations
- Show minimum payment requirement based on balance
- Allow custom payment amounts with validation
- Support multiple payment methods (EFT, check, cash)
- Display account balance context for informed decisions
- Validate payment amounts against business rules

---

## Business Flow:

### Phase 1: Payment Options Display

**Endpoint:** /api/v1/payments/calculate
**Method:** POST
**Trigger:** Page load with selected account ID

### Request Object:
```json
{
  "accountId": "12345678901"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| accountId | string(11) | Account to make payment on | Yes | Previous screen |

**Validations:**
- Account must exist and be accessible
- Account must be ACTIVE
- Account must have balance due > 0

**The System:**
- Retrieves current account balance
- Calculates minimum payment (2% of balance, min $25)
- Retrieves available payment methods for user
- Displays account summary for context
- Defaults to Full Balance option

### Response Object:
```json
{
  "account": {
    "accountId": "12345678901",
    "currentBalance": -2450.75,
    "balanceDue": 2450.75
  },
  "paymentOptions": {
    "minimumPayment": 49.02,
    "fullBalance": 2450.75,
    "customAmountMin": 25.00,
    "customAmountMax": 2450.75
  },
  "paymentMethods": [
    {
      "methodCode": "EFT",
      "methodName": "Electronic Transfer",
      "eftAccountId": "EFT123456",
      "accountLast4": "1234",
      "available": true
    },
    {
      "methodCode": "CHECK",
      "methodName": "Check",
      "available": true
    },
    {
      "methodCode": "CASH",
      "methodName": "Cash (At Branch)",
      "available": false
    }
  ]
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| currentBalance | decimal | Account balance (negative) |
| balanceDue | decimal | Absolute value owed |
| minimumPayment | decimal | 2% of balance (min $25) |
| fullBalance | decimal | Total amount owed |
| customAmountMin | decimal | Minimum custom payment ($25) |
| customAmountMax | decimal | Maximum custom payment (balance due) |
| methodCode | string | Payment method identifier |
| methodName | string | Display name |
| eftAccountId | string | EFT account identifier |
| accountLast4 | string | Last 4 of bank account |
| available | boolean | Method currently available |

**Validations:**
- Minimum payment = max(2% * balanceDue, $25)
- Custom amount must be >= $25 and <= balanceDue
- At least one payment method must be available

### Phase 2: Payment Submission

**Endpoint:** /api/v1/payments/validate
**Method:** POST
**Trigger:** User clicks "Continue to Review"

### Request Object:
```json
{
  "accountId": "12345678901",
  "paymentType": "FULL",
  "amount": 2450.75,
  "paymentMethod": "EFT",
  "eftAccountId": "EFT123456"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| accountId | string(11) | Account ID | Yes | Previous screen |
| paymentType | string | MINIMUM, FULL, CUSTOM | Yes | Radio selection |
| amount | decimal | Payment amount | Yes | Selection/input |
| paymentMethod | string | EFT, CHECK, CASH | Yes | Dropdown |
| eftAccountId | string | EFT account ID | Conditional | Payment method data |

**Validations:**
- Amount must match payment type:
  - MINIMUM: amount = minimumPayment
  - FULL: amount = balanceDue
  - CUSTOM: $25 <= amount <= balanceDue
- Payment method must be available
- EFT account required if method = EFT

**The System:**
- Validates payment amount against rules
- Shows loading indicator during validation
- Displays warning if custom amount < minimum payment
- Shows EFT account details if EFT selected
- Disables continue button until valid selection

### Response Processing:

**Valid Response / Complete Response:**
- Navigate to payment review screen
- Pass payment details to next screen
- Display summary: amount, method, account
- Log payment initiation event

**Error Response / Incomplete Response:**
- **400 Bad Request - Invalid Amount:**
  - Display: "Payment amount must be at least $25.00"
  - For custom < minimum: "Warning: Payment is less than minimum payment of $49.02"
  - Highlight amount field
  - Allow override with confirmation

- **422 Unprocessable - Payment Method Unavailable:**
  - Display: "Selected payment method is currently unavailable"
  - Suggest alternative method
  - Update available methods list

- **409 Conflict - Balance Changed:**
  - Display: "Account balance has changed. Refreshing payment options."
  - Reload payment calculation
  - Adjust amounts to new balance

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| accountId | string | "" | Previous screen |
| balanceDue | number | 0 | API response |
| minimumPayment | number | 0 | API response |
| paymentType | string | "FULL" | Radio selection |
| customAmount | number | 0 | Input onChange |
| paymentMethod | string | "EFT" | Dropdown selection |
| paymentMethods | array | [] | API response |
| selectedAmount | number | 0 | Calculated from type/custom |

---

## Edge Case Scenarios:

* **Custom Amount Less Than Minimum**
  * When it happens: User enters amount < minimum payment
  * System behavior: Show warning "Less than minimum payment. Late fees may apply. Continue?"

* **Custom Amount Greater Than Balance**
  * When it happens: User enters amount > balance due
  * System behavior: Block entry, show "Cannot exceed balance of $2,450.75"

* **EFT Account Selection**
  * When it happens: User selects EFT method
  * System behavior: Display bank account ending in XXXX1234, show "Funds will be withdrawn on {date}"

* **Payment Type Toggle**
  * When it happens: User switches between minimum/full/custom
  * System behavior: Update amount display, enable/disable custom input, recalculate if needed