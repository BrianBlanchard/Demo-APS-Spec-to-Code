# Login Screen

## Scenario: User Authentication

---

## Business Use Case:
This screen provides secure access to the Advanced Payment System by authenticating users based on their credentials. It serves as the primary entry point for administrators, customer service representatives, customers, and system operations personnel. The screen implements role-based access control to ensure users only access functionality appropriate to their authorization level.

---

## Goals:
- Authenticate users securely using User ID and password credentials
- Enforce strong authentication policies including password complexity and account lockout rules
- Track failed login attempts for security monitoring and compliance
- Redirect authenticated users to appropriate landing pages based on their user type
- Provide password recovery mechanism for users who have forgotten credentials

---

## Business Flow:

### Phase 1: User Credential Submission

**Endpoint:** /api/v1/auth/login
**Method:** POST
**Trigger:** User clicks "Login" button after entering User ID and password

### Request Object:
```json
{
  "userId": "USR12345",
  "password": "encrypted_password_hash",
  "sessionContext": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| userId | string(8) | 8-character user identifier | Yes | User input |
| password | string | Encrypted password hash | Yes | User input (encrypted client-side) |
| sessionContext | object | Browser and network context | Yes | Auto-captured |
| ipAddress | string | Client IP address | Yes | Auto-detected |
| userAgent | string | Browser user agent | Yes | Auto-detected |
| timestamp | ISO8601 | Login attempt timestamp | Yes | Client timestamp |

**Validations:**
- User ID must be exactly 8 characters (alphanumeric)
- Password field cannot be empty
- Password must meet minimum complexity requirements (8+ chars, mix of upper/lower/digit)
- Rate limiting: Maximum 5 login attempts per User ID per 15-minute window
- Account lockout after 3 consecutive failed attempts

**The System:**
- Displays loading spinner on login button during authentication
- Disables form inputs to prevent multiple submissions
- Encrypts password on client-side before transmission
- Validates User ID format before API call
- Logs all authentication attempts (success and failure) with timestamps

### Response Object:
```json
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_string",
  "user": {
    "userId": "USR12345",
    "firstName": "John",
    "lastName": "Smith",
    "userType": "ADMIN",
    "permissions": ["account.view", "account.update", "user.manage"]
  },
  "expiresIn": 3600,
  "landingPage": "/dashboard/admin"
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| success | boolean | Authentication result |
| sessionToken | string | JWT token for API authentication |
| refreshToken | string | Token for session renewal |
| user | object | Authenticated user details |
| userType | string | ADMIN, CSR, CUSTOMER, OPERATIONS |
| permissions | array | List of granted permissions |
| expiresIn | number | Token expiration in seconds |
| landingPage | string | Route to redirect after login |

**Validations:**
- Session token must be stored in secure HTTP-only cookie
- Token expiration must be enforced client-side
- User permissions must match role definitions in security policy

### Response Processing:

**Valid Response / Complete Response:**
- Store session token in secure storage (HTTP-only cookie)
- Store user profile in application state/local storage
- Log successful authentication event
- Redirect to landingPage based on user type:
  - ADMIN → /dashboard/admin
  - CSR → /dashboard/csr
  - CUSTOMER → /accounts/my-accounts
  - OPERATIONS → /operations/batch-jobs
- Display welcome message with user's first name
- Initialize session timeout countdown

**Error Response / Incomplete Response:**
- **401 Unauthorized - Invalid Credentials:**
  - Display error: "Invalid User ID or Password. Please try again."
  - Clear password field, maintain User ID
  - Focus password input field
  - Increment failed attempt counter
  - If 3 attempts: Display "Account locked. Contact administrator."

- **423 Locked - Account Locked:**
  - Display error: "Account locked due to multiple failed attempts. Contact help desk."
  - Disable login button for 15 minutes
  - Show countdown timer
  - Log security event

- **429 Too Many Requests:**
  - Display: "Too many login attempts. Please wait {X} seconds."
  - Show countdown timer
  - Disable submit button until timer expires

- **500 Server Error:**
  - Display: "System unavailable. Please try again later."
  - Log error with timestamp
  - Provide help desk contact information

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| userId | string | "" | onChange handler |
| password | string | "" | onChange handler |
| isLoading | boolean | false | Login button click / API response |
| errorMessage | string | null | API error response |
| failedAttempts | number | 0 | Failed login response |
| isLocked | boolean | false | Account lockout response |
| lockoutTimer | number | 0 | Lockout countdown |

---

## Edge Case Scenarios:

* **Session Timeout During Login**
  * When it happens: Network delay > 30 seconds
  * System behavior: Show timeout message, reset form, allow retry

* **Expired Account**
  * When it happens: User account deactivated
  * System behavior: Display "Account inactive. Contact administrator." with help desk number

* **First-Time Login / Password Reset Required**
  * When it happens: New user or admin-forced password reset
  * System behavior: Redirect to password change screen before dashboard access

* **Concurrent Session Detection**
  * When it happens: User already logged in from another location
  * System behavior: Prompt "Already logged in elsewhere. Terminate other session?" with Yes/No options

* **Browser Back Button After Logout**
  * When it happens: User navigates back after logout
  * System behavior: Session token invalid, redirect to login with message "Session expired. Please login again."