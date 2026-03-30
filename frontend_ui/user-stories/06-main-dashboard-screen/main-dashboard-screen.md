# Main Dashboard Screen

## Scenario: Main Application Dashboard

---

## Business Use Case:
Central navigation hub for authenticated users providing role-based access to key system functions. Dashboard displays personalized greeting and menu options appropriate to user's role (Administrator, Customer Service Representative, Customer, or Operations). Serves as the landing page after successful login and primary navigation point for all system features.

---

## Goals:
- Provide intuitive navigation to all authorized system functions
- Display role-appropriate menu options based on user permissions
- Show user identification and session status
- Enable quick access to most frequently used features
- Maintain session security with activity tracking

---

## Business Flow:

### Phase 1: Dashboard Initialization

**Endpoint:** /api/v1/dashboard/init
**Method:** GET
**Trigger:** Page load after successful authentication

### Request Object:
```json
{
  "sessionToken": "jwt_token_string",
  "userId": "USR12345"
}
```

**Field Description:**
| Object Field | Data Type | Description | Mandatory | Source |
|:------------:|:---------:|:-----------:|:---------:|:------:|
| sessionToken | string | Active session JWT token | Yes | Cookie/session storage |
| userId | string(8) | Authenticated user ID | Yes | Session data |

**Validations:**
- Session token must be valid and not expired
- User session must be active in system
- Token signature must be verified

**The System:**
- Validates session token on page load
- Retrieves user profile and permissions from session
- Determines visible menu items based on user role
- Initializes session activity tracker
- Sets up session timeout warning (after 25 minutes of inactivity)

### Response Object:
```json
{
  "user": {
    "userId": "USR12345",
    "firstName": "John",
    "lastName": "Smith",
    "userType": "ADMIN",
    "lastLoginTime": "2024-01-15T09:30:00Z"
  },
  "menuItems": [
    {
      "id": "account-management",
      "title": "Account Management",
      "description": "View and manage accounts",
      "route": "/accounts",
      "icon": "account_balance",
      "permissions": ["account.view", "account.update"]
    },
    {
      "id": "card-management",
      "title": "Card Management",
      "description": "Issue and manage cards",
      "route": "/cards",
      "icon": "credit_card",
      "permissions": ["card.view", "card.issue"]
    }
  ],
  "sessionTimeout": 1800,
  "systemNotifications": []
}
```

**Field Description:**
| Object Field | Data Type | Description |
|:------------:|:---------:|:-----------:|
| user | object | Authenticated user details |
| userType | string | ADMIN, CSR, CUSTOMER, OPERATIONS |
| lastLoginTime | ISO8601 | Previous login timestamp |
| menuItems | array | Available navigation options |
| permissions | array | Required permissions for menu item |
| sessionTimeout | number | Session timeout in seconds (30 min) |
| systemNotifications | array | Important system messages |

**Validations:**
- Menu items filtered based on user permissions
- Session timeout must be enforced client-side

### Response Processing:

**Valid Response / Complete Response:**
- Display personalized greeting: "Welcome, {firstName} {lastName}"
- Render menu cards for authorized functions
- Show last login timestamp in footer
- Initialize session timeout countdown
- Enable navigation to menu items
- Display system notifications if any exist
- Log dashboard access event

**Error Response / Incomplete Response:**
- **401 Unauthorized - Session Expired:**
  - Clear session data
  - Redirect to login screen
  - Display: "Session expired. Please login again."
  - Pre-populate User ID if available

- **403 Forbidden - Insufficient Permissions:**
  - Display: "Access denied. Contact administrator for permissions."
  - Show help desk contact information
  - Log unauthorized access attempt

- **500 Server Error:**
  - Display: "Unable to load dashboard. Please try again."
  - Show retry button
  - Enable logout option

---

## UI State Management:

| State Variable | Type | Initial Value | Updated By |
|----------------|------|---------------|------------|
| user | object | null | API response |
| menuItems | array | [] | API response filtered by permissions |
| sessionTimeRemaining | number | 1800 | Countdown timer (decrements every second) |
| showTimeoutWarning | boolean | false | Triggered at 5 minutes remaining |
| systemNotifications | array | [] | API response |
| lastActivityTime | timestamp | now | User interaction events |

---

## Edge Case Scenarios:

* **Session Timeout Warning**
  * When it happens: 5 minutes before session expiration (25 min of inactivity)
  * System behavior: Show modal "Session expiring in 5 minutes. Continue working?" with Extend/Logout buttons

* **Session Expired During Idle**
  * When it happens: 30 minutes of no user activity
  * System behavior: Auto-logout, redirect to login, display "Session timed out due to inactivity"

* **Concurrent Session Detection**
  * When it happens: User logs in from different browser/device
  * System behavior: Show alert "New login detected. This session will be terminated." then force logout

* **Permission Change During Active Session**
  * When it happens: Admin modifies user permissions while user is logged in
  * System behavior: Refresh menu items on next activity, hide newly-restricted features

* **Network Disconnection**
  * When it happens: Network connection lost
  * System behavior: Show offline indicator, queue actions, attempt reconnection, warn user of offline state