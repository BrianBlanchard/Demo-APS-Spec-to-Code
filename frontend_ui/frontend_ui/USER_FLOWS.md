# Advanced Payment System - User Flows

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION                            │
└─────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │ Login Screen │ (05-login-screen)
          └──────┬───────┘
                 │
         ┌───────┴────────┐
         │                │
    ✅ Success      ❌ Forgot Password?
         │                │
         │         ┌──────▼──────────┐
         │         │ Password Reset  │ (08-password-reset-screen)
         │         │ • User ID       │
         │         │ • SSN Last 4    │
         │         └──────┬──────────┘
         │                │
         │         ┌──────▼──────────────┐
         │         │ New Password Entry  │ (07-new-password-entry-screen)
         │         │ • Strength Meter    │
         │         │ • 15-min Timer      │
         │         └──────┬──────────────┘
         │                │
         └────────┬───────┘
                  │
          ┌───────▼────────┐
          │   Dashboard    │ (06-main-dashboard-screen)
          └────────────────┘
```

---

## 🏦 Account Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ACCOUNT MANAGEMENT                           │
└─────────────────────────────────────────────────────────────────┘

       ┌──────────────┐
       │  Dashboard   │
       └──────┬───────┘
              │
     ┌────────▼───────────┐
     │ Account Search     │ (03-account-search-screen)
     │ • Account Number   │
     │ • Customer ID      │
     │ • Customer Name    │
     └────────┬───────────┘
              │
     ┌────────▼─────────────┐
     │ Search Results       │ (02-account-search-results-screen)
     │ • Paginated Cards    │
     │ • Balance Display    │
     │ • Status Badges      │
     └────────┬─────────────┘
              │
     ┌────────▼─────────────┐
     │ Account Detail       │ (01-account-detail-view-screen)
     │ • Full Info          │
     │ • Balance            │
     │ • Interest Rate      │
     └────────┬─────────────┘
              │
              │ Update Account
              │
     ┌────────▼─────────────┐
     │ Account Update Form  │ (04-account-update-form-screen)
     │ • Credit Limit       │
     │ • Account Status     │
     │ • FICO Validation    │
     └──────────────────────┘
```

---

## 💰 Payment Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAYMENT PROCESSING                           │
└─────────────────────────────────────────────────────────────────┘

       ┌──────────────┐
       │  Dashboard   │
       └──────┬───────┘
              │
     ┌────────▼────────────────┐
     │ Payment Account Select  │ (09-payment-account-selection-screen)
     │ • List Accounts         │
     │ • Overdue Warnings      │
     │ • Balance Display       │
     └────────┬────────────────┘
              │
     ┌────────▼────────────────┐
     │ Payment Amount          │ (10-payment-amount-selection-screen)
     │ • Minimum Payment       │
     │ • Full Balance          │
     │ • Custom Amount         │
     │ • Payment Method        │
     └────────┬────────────────┘
              │
     ┌────────▼────────────────┐
     │ Payment Review          │ (12-payment-review-screen)
     │ • Summary               │
     │ • Authorization ☑       │
     │ • Duplicate Warning     │
     └────────┬────────────────┘
              │
     ┌────────▼────────────────┐
     │ Payment Confirmation    │ (11-payment-confirmation-screen)
     │ • Success ✓             │
     │ • Confirmation #        │
     │ • Print Receipt 🖨      │
     │ • Next Actions          │
     └─────────────────────────┘
```

---

## 💳 Transaction Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRANSACTION PROCESSING                         │
└─────────────────────────────────────────────────────────────────┘

       ┌──────────────┐
       │  Dashboard   │
       └──────┬───────┘
              │
       ┌──────┴──────┐
       │             │
Transaction Entry   Transaction Search
       │             │
       │    ┌────────▼─────────────┐
       │    │ Transaction Search   │ (15-transaction-search-screen)
       │    │ • Account Number     │
       │    │ • Date Range         │
       │    │ • Transaction Type   │
       │    │ • Amount Range       │
       │    │ • Results Table      │
       │    └──────────────────────┘
       │
┌──────▼────────────────┐
│ Transaction Entry     │ (14-transaction-entry-screen)
│ • Card Lookup         │
│ • Transaction Type    │
│ • Amount              │
│ • Description         │
└──────┬────────────────┘
       │
┌──────▼────────────────┐
│ Transaction Confirm   │ (13-transaction-confirmation-screen)
│ • Success ✓           │
│ • Transaction ID      │
│ • Print Option 🖨     │
│ • Next Actions        │
└───────────────────────┘
```

---

## 🎯 Complete Screen Map

### Authentication & Session (4 screens)
- **05** - Login Screen
- **08** - Password Reset Screen
- **07** - New Password Entry Screen
- **06** - Main Dashboard Screen

### Account Management (4 screens)
- **03** - Account Search Screen
- **02** - Account Search Results Screen
- **01** - Account Detail View Screen
- **04** - Account Update Form Screen

### Payment Processing (4 screens)
- **09** - Payment Account Selection Screen
- **10** - Payment Amount Selection Screen
- **12** - Payment Review Screen
- **11** - Payment Confirmation Screen

### Transaction Processing (3 screens)
- **14** - Transaction Entry Screen
- **13** - Transaction Confirmation Screen
- **15** - Transaction Search Screen

**Total: 15 Screens** ✅

---

## 🔄 Navigation Patterns

### Primary Navigation
```
Dashboard
  ├── Account Management    → Account Search
  ├── Transaction Entry     → Transaction Entry Form
  ├── Transaction Search    → Transaction Search Form
  └── Payments             → Payment Account Selection
```

### Back Button Hierarchy
```
Detail → Results → Search → Dashboard
Confirm → Review → Amount → Selection → Dashboard
Update → Detail → Results → Search → Dashboard
```

### Logout
```
Any Screen → [Logout Button] → Login Screen
```

---

## 📱 Screen Features Matrix

| Screen | Search | Form | Table | Cards | Status | Print | Timer |
|--------|--------|------|-------|-------|--------|-------|-------|
| Login | - | ✓ | - | - | - | - | - |
| Dashboard | - | - | - | ✓ | - | - | - |
| Password Reset | - | ✓ | - | - | - | - | - |
| New Password | - | ✓ | - | - | - | - | ✓ |
| Account Search | ✓ | ✓ | - | - | - | - | - |
| Search Results | - | - | - | ✓ | ✓ | - | - |
| Account Detail | - | - | - | - | ✓ | - | - |
| Account Update | - | ✓ | - | - | ✓ | - | - |
| Payment Select | - | - | - | ✓ | - | - | - |
| Payment Amount | - | ✓ | - | - | - | - | - |
| Payment Review | - | ✓ | - | - | - | - | - |
| Payment Confirm | - | - | - | - | ✓ | ✓ | - |
| Transaction Entry | - | ✓ | - | - | - | - | - |
| Transaction Confirm | - | - | - | - | ✓ | ✓ | - |
| Transaction Search | ✓ | ✓ | ✓ | - | ✓ | - | - |

---

## 🎨 UI Components Used

### By Screen Type

**Login & Auth Screens**
- Input (User ID, Password, SSN)
- Button (Submit, Reset)
- Alert (Errors, Success)
- Spinner (Loading)

**Dashboard**
- Card (Menu Items)
- Button (Navigation, Logout)

**Search Screens**
- Input (Search Criteria)
- Button (Search, Clear)
- Card (Results)
- Alert (No Results, Errors)

**Detail Screens**
- Card (Container)
- Button (Back, Update)
- Status Badge

**Form Screens**
- Input (Fields)
- Button (Submit, Cancel)
- Alert (Validation, Success)
- Spinner (Submitting)

**Confirmation Screens**
- Card (Details)
- Button (Print, Next Actions)
- Alert (Success)
- Status Badge

---

## 🔐 Permission & Role-Based Access

### Dashboard Menu (Role-Based)

**ADMIN:**
- ✓ Account Management
- ✓ Transaction Entry
- ✓ Transaction Search
- ✓ Payments
- ✓ User Management (future)

**CSR (Customer Service Representative):**
- ✓ Account Management
- ✓ Transaction Entry
- ✓ Transaction Search
- ✓ Payments

**CUSTOMER:**
- ✓ View My Accounts
- ✓ Make Payments
- ✓ View Transactions

**OPERATIONS:**
- ✓ Transaction Search
- ✓ Account Reports
- ✓ Batch Jobs (future)

---

## 📊 User Journey Examples

### Example 1: Pay Overdue Bill
```
Login → Dashboard → Payments → Select Overdue Account
→ Choose Full Balance → Review → Confirm → Print Receipt
```

### Example 2: Search & Update Account
```
Login → Dashboard → Account Management → Search by Account#
→ View Results → Account Detail → Update Form → Save → Confirm
```

### Example 3: Reset Forgotten Password
```
Login → Forgot Password → Enter User ID & SSN → New Password
→ Enter Strong Password → Confirm → Login with New Password
```

### Example 4: Process Transaction
```
Login → Dashboard → Transaction Entry → Enter Card# → Lookup
→ Select Type → Enter Amount → Submit → Confirmation → Print
```

### Example 5: Find Transactions
```
Login → Dashboard → Transaction Search → Enter Criteria
→ Set Date Range → Search → View Results Table → Export
```

---

**All flows tested and working!** ✅
