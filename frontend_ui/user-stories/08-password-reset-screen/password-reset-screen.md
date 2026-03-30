# Password Reset Screen

## Scenario: Forgotten Password Recovery

---

## Business Use Case:
Allows users who have forgotten their password to securely reset it after verifying their identity. This self-service capability reduces help desk burden while maintaining security compliance. The system verifies the user's identity using their User ID and last 4 digits of SSN before allowing password reset.

---

## Goals:
- Enable self-service password reset without administrator intervention
- Verify user identity before granting password reset capability
- Maintain audit trail of all password reset requests for security compliance
- Generate temporary reset tokens with time-limited validity
- Notify users of password changes for security awareness

---

## Business Flow:

### Phase 1: Identity Verification Request

**Endpoint:** /api/v1/auth/password-reset/verify
**Method:** POST
**Trigger:** User clicks "Verify Identity" button

### Request Object:
```json
{
  "userId": "USR12345",
  "ssnLast4": "1234",
  "verificationContext": {
    "ipAddress": "192.168.1.100",
    "timestamp": "2024-01-15T10:45:00Z"
  }
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| userId | string(8) | User identifier | Yes | User input |
| ssnLast4 | string(4) | Last 4 digits of SSN | Yes | User input |
| verificationContext | object | Request context | Yes | Auto-captured |

**Validations:**
- User ID must be exactly 8 characters
- SSN Last 4 must be exactly 4 numeric digits
- Rate limiting: Maximum 3 verification attempts per User ID per hour
- System logs all verification attempts

**The System:**
- Shows loading indicator during verification
- Masks SSN input (shows dots instead of numbers)
- Validates input format before API submission
- Disables submit button during processing

### Response Object:
```json
{
  "verified": true,
  "resetToken": "temp_reset_token_12345",
  "tokenExpiresIn": 900,
  "nextStep": "/auth/password-reset/new-password"
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| verified | boolean | Identity verification result |
| resetToken | string | Temporary reset token (15 min validity) |
| tokenExpiresIn | number | Token expiration in seconds |
| nextStep | string | Next screen route |

**Validations:**
- Reset token must be stored securely in session
- Token expiration countdown must be displayed to user

### Response Processing:

**Valid Response / Complete Response:**
- Store resetToken in secure session storage
- Navigate to new password screen (/auth/password-reset/new-password)
- Display countdown timer showing token expiration (15 minutes)
- Pass User ID to next screen
- Log successful verification event

**Error Response / Incomplete Response:**
- **404 Not Found - User Not Found:**
  - Display: "User ID not found. Please check and try again."
  - Clear all input fields
  - Focus User ID field

- **401 Unauthorized - Verification Failed:**
  - Display: "Identity verification failed. Information does not match our records."
  - Clear SSN field only
  - Increment failed verification counter
  - If 3 attempts: "Too many failed attempts. Please contact help desk."

- **429 Too Many Requests:**
  - Display: "Too many verification attempts. Please try again in {X} minutes."
  - Disable verify button
  - Show countdown timer

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| userId | string | "" | onChange handler |
| ssnLast4 | string | "" | onChange handler (numeric only) |
| isVerifying | boolean | false | API call state |
| errorMessage | string | null | API error response |
| failedAttempts | number | 0 | Verification failure |

---

## Edge Case Scenarios:

* **Account Locked**
  * When it happens: User account is locked due to failed login attempts
  * System behavior: Display "Account locked. Contact administrator at (800) 555-0100."

* **Inactive User Account**
  * When it happens: User account has been deactivated
  * System behavior: Display "Account inactive. Please contact help desk for assistance."

* **Token Expiration During Entry**
  * When it happens: User takes > 15 minutes on password entry screen
  * System behavior: Redirect back to verification with message "Reset token expired. Please verify identity again."