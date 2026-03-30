# Account Update Form Screen

## Scenario: Account Information Modification

---

## Business Use Case:
Enables authorized users (administrators and specific CSR roles) to modify account information including credit limits and account status. Implements two-step confirmation process for security and compliance. All changes are validated against business rules (e.g., credit limit must align with FICO score) and logged to audit trail. Critical for account management, credit line adjustments, and account closure processes.

---

## Goals:
- Allow authorized modification of account parameters
- Enforce business rules and validation during updates
- Implement two-step confirmation to prevent accidental changes
- Maintain complete audit trail of all modifications
- Validate credit limit changes against customer FICO score
- Support account status changes (activation/deactivation)

---

## Business Flow:

### Phase 1: Update Form Initialization

**Endpoint:** /api/v1/accounts/{accountId}
**Method:** GET
**Trigger:** Page load from account detail screen

### Request Object:
```json
{
  "accountId": "12345678901"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| accountId | string(11) | Account to update | Yes | URL parameter |

**Validations:**
- User must have account.update permission
- Account must exist and be accessible

**The System:**
- Loads current account data into form fields
- Marks fields as protected/unprotected based on permissions
- Displays current values as defaults
- Enables only editable fields for user's role
- Shows confirmation requirement notice

### Phase 2: Account Update Submission

**Endpoint:** /api/v1/accounts/{accountId}
**Method:** PUT
**Trigger:** User clicks "Save Changes" button

### Request Object:
```json
{
  "accountId": "12345678901",
  "updates": {
    "creditLimit": 12000.00,
    "cashCreditLimit": 2400.00,
    "accountStatus": "ACTIVE"
  },
  "confirmationRequired": true,
  "userId": "USR12345",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| accountId | string(11) | Account identifier | Yes | URL/form |
| creditLimit | decimal | New credit limit | No | User input |
| cashCreditLimit | decimal | New cash limit | No | User input |
| accountStatus | string | ACTIVE or INACTIVE | No | User selection |
| confirmationRequired | boolean | Requires F5 confirmation | Yes | System |
| userId | string(8) | User making change | Yes | Session |
| timestamp | ISO8601 | Change timestamp | Yes | System |

**Validations:**
- Credit limit must be >= 1000 and <= 100000
- Cash credit limit must be <= credit limit
- Cash credit limit typically 20% of credit limit
- Credit limit increase > 20% requires manager approval
- Account status change to INACTIVE requires zero balance
- FICO score validation:
  - FICO 300-579: Max limit $5,000
  - FICO 580-669: Max limit $10,000
  - FICO 670-739: Max limit $25,000
  - FICO 740-850: Max limit $100,000

**The System:**
- Shows loading indicator on Save button
- Validates all fields before submission
- Implements optimistic locking (checks for concurrent updates)
- Requires F5 key confirmation before final commit
- Disables form fields during submission
- Logs update attempt regardless of success/failure

### Response Object:
```json
{
  "success": true,
  "message": "Account updated successfully",
  "updatedFields": ["creditLimit", "cashCreditLimit"],
  "account": {
    "accountId": "12345678901",
    "creditLimit": 12000.00,
    "cashCreditLimit": 2400.00,
    "accountStatus": "ACTIVE",
    "lastModifiedBy": "USR12345",
    "lastModifiedDate": "2024-01-15T14:30:00Z"
  },
  "auditRecordId": "AUD789012"
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| success | boolean | Update result |
| message | string | Success/error message |
| updatedFields | array | List of changed fields |
| account | object | Updated account data |
| lastModifiedBy | string | User ID who made change |
| lastModifiedDate | ISO8601 | Modification timestamp |
| auditRecordId | string | Audit log record ID |

**Validations:**
- Updated data must reflect all submitted changes
- Audit record must be created
- Optimistic lock version must be incremented

### Response Processing:

**Valid Response / Complete Response:**
- Display success toast: "Account updated successfully"
- Show summary of changes made:
  - "Credit Limit: $10,000 → $12,000"
  - "Cash Limit: $2,000 → $2,400"
- Navigate back to account detail view after 2 seconds
- Refresh account data to show new values
- Log audit event with change details
- Clear form state

**Error Response / Incomplete Response:**
- **400 Bad Request - Validation Error:**
  - Display specific validation failures:
    - "Credit limit exceeds maximum for FICO score 725"
    - "Cash limit cannot exceed credit limit"
    - "Cannot deactivate account with outstanding balance"
  - Highlight invalid fields in red
  - Keep form data intact for correction
  - Focus first invalid field

- **409 Conflict - Concurrent Update:**
  - Display: "Account was modified by another user. Please review and resubmit."
  - Reload current account data
  - Highlight differences between user's changes and current data
  - Allow user to re-apply changes

- **403 Forbidden - Insufficient Permissions:**
  - Display: "You do not have permission to update this account."
  - For credit limit increases > 20%: "Credit limit increase requires manager approval"
  - Disable save button
  - Show help desk contact

- **428 Precondition Required - Missing Confirmation:**
  - Display: "Press F5 to confirm changes"
  - Keep form in pending state
  - Wait for F5 key press
  - Resubmit with confirmation flag

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| accountId | string | "" | URL parameter |
| creditLimit | number | 0 | Form input / API response |
| cashCreditLimit | number | 0 | Form input / API response |
| accountStatus | string | "" | Radio selection |
| originalData | object | {} | Initial API load |
| isDirty | boolean | false | Form change detection |
| isSubmitting | boolean | false | Save button click |
| requiresConfirmation | boolean | true | System config |
| validationErrors | object | {} | Client/server validation |

---

## Edge Case Scenarios:

* **F5 Confirmation Process**
  * When it happens: User clicks Save Changes
  * System behavior: Show "Press F5 to confirm" modal, listen for F5 key, resubmit with confirmation=true

* **Browser Refresh with Unsaved Changes**
  * When it happens: User refreshes page with modified form
  * System behavior: Show "You have unsaved changes. Leave page?" confirmation dialog

* **Account Balance Changed During Edit**
  * When it happens: Transactions posted while update form open
  * System behavior: Show warning "Account balance changed. Available credit calculation may be outdated."

* **Credit Limit Decrease Below Current Balance**
  * When it happens: User tries to set limit < abs(currentBalance)
  * System behavior: Block change, show "Credit limit cannot be less than current balance of $X,XXX.XX"

* **Manager Approval Required**
  * When it happens: Credit limit increase > 20%
  * System behavior: Create approval request, notify manager, show "Pending manager approval" status