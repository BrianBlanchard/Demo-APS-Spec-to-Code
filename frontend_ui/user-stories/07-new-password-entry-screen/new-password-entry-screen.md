# New Password Entry Screen

## Scenario: Password Reset Completion

---

## Business Use Case:
Final step in password reset process where user creates a new secure password. System enforces strong password policies including minimum length, character complexity, and password history rules to maintain security compliance with organizational standards and PCI DSS requirements.

---

## Goals:
- Enable user to set new secure password after identity verification
- Enforce strong password policy requirements (complexity, length, history)
- Provide real-time validation feedback on password strength
- Complete password reset workflow and notify user of successful change
- Invalidate reset token after successful password update

---

## Business Flow:

### Phase 1: New Password Submission

**Endpoint:** /api/v1/auth/password-reset/complete
**Method:** POST
**Trigger:** User clicks "Reset Password" button

### Request Object:
```json
{
  "resetToken": "temp_reset_token_12345",
  "userId": "USR12345",
  "newPassword": "encrypted_password_hash",
  "confirmPassword": "encrypted_password_hash"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| resetToken | string | Temporary verification token | Yes | Session storage |
| userId | string(8) | User identifier | Yes | Previous screen |
| newPassword | string | New password (encrypted) | Yes | User input |
| confirmPassword | string | Password confirmation | Yes | User input |

**Validations:**
- Password must be minimum 8 characters
- Must contain uppercase and lowercase letters
- Must contain at least 1 number
- Must contain at least 1 special character (!@#$%^&*)
- Cannot be same as previous 5 passwords (password history check)
- Cannot contain User ID or common dictionary words
- New password and confirm password must match
- Reset token must be valid and not expired

**The System:**
- Real-time password strength indicator (Weak/Medium/Strong)
- Live validation showing which requirements are met (checkmarks)
- Encrypts password client-side before transmission
- Shows/hides password toggle button
- Disables submit button until all requirements met

### Response Object:
```json
{
  "success": true,
  "message": "Password reset successfully",
  "redirectUrl": "/auth/login",
  "notificationSent": true
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| success | boolean | Password reset result |
| message | string | Success confirmation message |
| redirectUrl | string | Login screen route |
| notificationSent | boolean | Email notification sent flag |

**Validations:**
- Reset token must be invalidated after successful password change
- Notification confirmation logged in audit trail

### Response Processing:

**Valid Response / Complete Response:**
- Display success toast: "Password reset successfully. Please login with your new password."
- Clear all form fields
- Invalidate and remove reset token from session
- Wait 2 seconds to allow user to read success message
- Redirect to login screen (/auth/login)
- Pre-populate User ID on login screen
- Log password change event with timestamp

**Error Response / Incomplete Response:**
- **400 Bad Request - Password Policy Violation:**
  - Display specific policy violations:
    - "Password must be at least 8 characters"
    - "Password must contain uppercase and lowercase letters"
    - "Password cannot match previous passwords"
  - Keep focus on password field
  - Show password requirements checklist with failed items highlighted

- **401 Unauthorized - Invalid/Expired Token:**
  - Display: "Reset token expired. Please restart password reset process."
  - Clear all fields
  - Redirect to password reset verification screen after 3 seconds

- **409 Conflict - Password History Violation:**
  - Display: "Password cannot be the same as your last 5 passwords. Choose a different password."
  - Clear password fields
  - Focus new password field

- **422 Unprocessable - Passwords Don't Match:**
  - Display: "Passwords do not match. Please re-enter."
  - Clear confirm password field
  - Focus confirm password field

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| newPassword | string | "" | onChange handler |
| confirmPassword | string | "" | onChange handler |
| passwordStrength | string | "" | Password validator (Weak/Medium/Strong) |
| requirementsMet | object | {length: false, upper: false, lower: false, number: false} | Real-time validation |
| showPassword | boolean | false | Toggle button |
| isSubmitting | boolean | false | API call state |
| tokenExpiry | number | 900 | Countdown timer |

---

## Edge Case Scenarios:

* **Token Expiration During Password Entry**
  * When it happens: 15-minute token expires while user is typing
  * System behavior: Show modal "Reset token expired. Redirecting to verification...", redirect after 3 seconds

* **Password Paste Disabled**
  * When it happens: User attempts to paste password
  * System behavior: Block paste action, show tooltip "Please type password manually for security"

* **Network Timeout**
  * When it happens: API call takes > 10 seconds
  * System behavior: Show retry option, preserve form data, "Network timeout. Please try again."

* **Browser Autocomplete Conflict**
  * When it happens: Browser suggests old saved password
  * System behavior: Autocomplete disabled on password fields, show message if old password detected