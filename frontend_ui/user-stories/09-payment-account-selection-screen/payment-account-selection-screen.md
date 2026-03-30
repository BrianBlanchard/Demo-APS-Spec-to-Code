# Payment Account Selection Screen

## Scenario: Payment Account Selection

---

## Business Use Case:
Enables customers and customer service representatives to select the credit card account for which they want to make a payment. Displays accounts associated with logged-in user (for customer view) or allows manual account entry (for CSR view). Shows current balance due for each account to help user decide payment amount.

---

## Goals:
- Display user's credit card accounts with current balance information
- Allow quick selection from account list or manual entry
- Show balance due prominently for payment decision
- Validate account access permissions before proceeding
- Support both customer self-service and CSR-assisted payment flows

---

## Business Flow:

### Phase 1: Account List Retrieval

**Endpoint:** /api/v1/payments/accounts
**Method:** GET
**Trigger:** Page load

### Request Object:
```json
{
  "userId": "USR12345",
  "userType": "CUSTOMER"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| userId | string(8) | Logged-in user ID | Yes | Session |
| userType | string | CUSTOMER, CSR, ADMIN | Yes | Session |

**Validations:**
- User must be authenticated
- User type determines account visibility

**The System:**
- For CUSTOMER users: Shows only accounts they own
- For CSR/ADMIN: Shows recent accounts plus manual entry option
- Displays loading skeleton while fetching accounts
- Calculates current balance (absolute value of negative balance)
- Highlights accounts with overdue payments

### Response Object:
```json
{
  "accounts": [
    {
      "accountId": "12345678901",
      "accountHolder": "John Smith",
      "currentBalance": -2450.75,
      "balanceDue": 2450.75,
      "minimumPayment": 49.02,
      "dueDate": "2024-02-05",
      "isOverdue": false,
      "accountStatus": "ACTIVE"
    }
  ],
  "allowManualEntry": true
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| accountId | string(11) | Account identifier |
| accountHolder | string | Primary account holder name |
| currentBalance | decimal | Current balance (negative = owed) |
| balanceDue | decimal | Absolute value of amount owed |
| minimumPayment | decimal | Minimum payment required (2% of balance) |
| dueDate | date | Payment due date |
| isOverdue | boolean | True if past due date |
| accountStatus | string | ACTIVE, INACTIVE |
| allowManualEntry | boolean | User can enter account ID manually |

**Validations:**
- Minimum payment = 2% of balance due (min $25)
- Only ACTIVE accounts shown
- Overdue flag if current date > due date

### Response Processing:

**Valid Response / Complete Response:**
- Display account cards with:
  - Account ID
  - Account holder name
  - Balance due in large text (red if overdue)
  - "OVERDUE" badge if past due date
- Enable click-to-select on account cards
- Show manual entry option if allowed
- Highlight selected account with border
- Enable Continue button when account selected
- Log account selection for analytics

**Error Response / Incomplete Response:**
- **404 Not Found - No Accounts:**
  - Display: "No accounts found for this user"
  - For CUSTOMER: Show help desk contact
  - For CSR: Show only manual entry option

- **403 Forbidden:**
  - Display: "You do not have permission to make payments"
  - Show help desk contact
  - Log unauthorized attempt

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| accounts | array | [] | API response |
| selectedAccountId | string | null | Account card click |
| manualAccountId | string | "" | Input onChange |
| isLoading | boolean | true | Page load / API |
| allowManualEntry | boolean | false | API response |

---

## Edge Case Scenarios:

* **Overdue Account Highlight**
  * When it happens: Account past due date
  * System behavior: Show red border, "OVERDUE" badge, display days overdue

* **Manual Account Entry Validation**
  * When it happens: CSR enters account ID manually
  * System behavior: Validate 11-digit format, lookup account, verify access permission, show account details for confirmation