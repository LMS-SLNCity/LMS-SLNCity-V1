# B2B Client Portal Implementation Guide

## Overview
The B2B Client Portal allows referral labs and diagnostic centers to:
- View all their reports
- Download reports as PDF
- Track real-time dues and payments
- View transaction history
- Manage their account

## Architecture

### Authentication Flow
1. B2B client logs in with Client ID + Password
2. Backend validates credentials against `b2b_client_logins` table
3. JWT token issued with `clientId` claim
4. Token used for subsequent API calls

### Database Schema

#### b2b_client_logins Table
```sql
CREATE TABLE b2b_client_logins (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id)
);
```

## Backend Implementation

### 1. B2B Authentication Route
**File**: `/server/src/routes/b2b-auth.ts`

```typescript
// POST /api/b2b/login
// Body: { clientId: number, password: string }
// Response: { token: string, client: Client }

// POST /api/b2b/logout
// Headers: { Authorization: "Bearer <token>" }

// POST /api/b2b/change-password
// Headers: { Authorization: "Bearer <token>" }
// Body: { oldPassword: string, newPassword: string }
```

### 2. B2B Client Routes
**File**: `/server/src/routes/b2b-clients.ts`

```typescript
// GET /api/b2b/profile
// Headers: { Authorization: "Bearer <token>" }
// Response: { id, name, type, balance, email, phone }

// GET /api/b2b/reports
// Headers: { Authorization: "Bearer <token>" }
// Query: { page: number, limit: number, status: string }
// Response: { reports: Visit[], total: number }

// GET /api/b2b/reports/:visitId
// Headers: { Authorization: "Bearer <token>" }
// Response: { visit: Visit, tests: VisitTest[] }

// GET /api/b2b/reports/:visitId/download
// Headers: { Authorization: "Bearer <token>" }
// Response: PDF file

// GET /api/b2b/transactions
// Headers: { Authorization: "Bearer <token>" }
// Query: { page: number, limit: number }
// Response: { transactions: LedgerEntry[], total: number }

// GET /api/b2b/dues
// Headers: { Authorization: "Bearer <token>" }
// Response: { currentDue: number, totalAmount: number, paidAmount: number }
```

### 3. Middleware
**File**: `/server/src/middleware/b2b-auth.ts`

```typescript
// Verify JWT token
// Extract clientId from token
// Validate client is active
// Attach client info to request
```

## Frontend Implementation

### 1. B2B Login Page
**File**: `/pages/B2BLoginPage.tsx`

Features:
- Client ID input
- Password input
- Remember me checkbox
- Login button
- Error handling
- Loading state

### 2. B2B Dashboard
**File**: `/pages/B2BClientPortal.tsx`

Components:
- Header with client name and logout
- Navigation tabs
- Dashboard overview (dues, reports count)
- Quick actions

### 3. Reports View
**File**: `/components/b2b/B2BReportsView.tsx`

Features:
- Table of all reports
- Search by visit code
- Filter by date range
- Filter by status
- Pagination
- Download button per report
- View details button

### 4. Transaction History
**File**: `/components/b2b/B2BTransactionHistory.tsx`

Features:
- Table of all transactions
- Filter by date range
- Filter by type (DEBIT/CREDIT)
- Pagination
- Export to CSV

### 5. Account Settings
**File**: `/components/b2b/B2BAccountSettings.tsx`

Features:
- View profile information
- Change password
- View contact information
- Download account statement

## API Endpoints Summary

### Authentication
- `POST /api/b2b/login` - Login
- `POST /api/b2b/logout` - Logout
- `POST /api/b2b/change-password` - Change password

### Client Data
- `GET /api/b2b/profile` - Get profile
- `GET /api/b2b/reports` - List reports
- `GET /api/b2b/reports/:id` - Get report details
- `GET /api/b2b/reports/:id/download` - Download report
- `GET /api/b2b/transactions` - List transactions
- `GET /api/b2b/dues` - Get current dues

## Implementation Steps

### Step 1: Backend Setup
1. Create `b2b_client_logins` table
2. Create B2B auth middleware
3. Create B2B auth routes
4. Create B2B client routes
5. Add JWT token generation

### Step 2: Frontend Setup
1. Create B2B login page
2. Create B2B context for auth state
3. Create B2B dashboard layout
4. Create reports view component
5. Create transaction history component

### Step 3: Integration
1. Connect login to backend
2. Store JWT token in localStorage
3. Add token to API requests
4. Handle token expiration
5. Implement logout

### Step 4: Testing
1. Test login with valid credentials
2. Test login with invalid credentials
3. Test report listing
4. Test report download
5. Test transaction history
6. Test token expiration

## Security Considerations

1. **Password Hashing**: Use bcryptjs for password hashing
2. **JWT Tokens**: Use HS256 algorithm, 24-hour expiration
3. **HTTPS**: Enforce HTTPS in production
4. **CORS**: Restrict CORS to allowed domains
5. **Rate Limiting**: Implement rate limiting on login endpoint
6. **Input Validation**: Validate all inputs
7. **SQL Injection**: Use parameterized queries
8. **XSS Protection**: Sanitize all outputs

## File Structure

```
/server/src/routes/
  ├── b2b-auth.ts (NEW)
  └── b2b-clients.ts (NEW)

/server/src/middleware/
  └── b2b-auth.ts (NEW)

/pages/
  ├── B2BLoginPage.tsx (NEW)
  └── B2BClientPortal.tsx (NEW)

/components/b2b/
  ├── B2BReportsView.tsx (NEW)
  ├── B2BTransactionHistory.tsx (NEW)
  └── B2BAccountSettings.tsx (NEW)

/context/
  └── B2BAuthContext.tsx (NEW)
```

## Next Steps

1. Implement B2B authentication backend
2. Create B2B login page
3. Create B2B dashboard
4. Implement report download
5. Add transaction history
6. Test all features


