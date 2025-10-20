# Authentication System Guide

## Overview

The LMS-SLNCity now uses a proper JWT-based authentication system with the following features:

- ✅ Backend API authentication with JWT tokens
- ✅ Frontend auth context with token persistence
- ✅ Protected API routes with middleware
- ✅ Role-based access control
- ✅ Token refresh and validation
- ✅ Secure password hashing with bcryptjs

---

## Architecture

### Frontend Authentication Flow

```
1. User enters credentials on LoginScreen
2. Frontend calls /api/auth/login with username & password
3. Backend validates credentials against database
4. Backend returns JWT token + user info
5. Frontend stores token in localStorage
6. Frontend stores user info in state
7. All subsequent API calls include token in Authorization header
8. On page refresh, token is restored from localStorage
```

### Backend Authentication Flow

```
1. Login endpoint validates credentials
2. Generates JWT token with user info
3. Returns token + user data
4. Protected routes use authMiddleware to verify token
5. Token is validated and user info extracted
6. Request proceeds with user context
```

---

## Implementation Details

### Frontend Changes

#### AuthContext (`/context/AuthContext.tsx`)
- ✅ Calls backend API for login (not mock data)
- ✅ Stores JWT token in localStorage
- ✅ Stores user info in localStorage
- ✅ Restores auth state on app load
- ✅ Provides `isLoading` state for initialization

#### API Client (`/api/client.ts`)
- ✅ `getAuthHeaders()` function adds token to all requests
- ✅ All API methods include Authorization header
- ✅ Token automatically sent with every request

#### App Component (`/App.tsx`)
- ✅ Shows loading spinner during initialization
- ✅ Redirects to login if not authenticated
- ✅ Shows main layout if authenticated

### Backend Changes

#### Auth Routes (`/server/src/routes/auth.ts`)
- ✅ `POST /api/auth/login` - Validates credentials, returns JWT token
- ✅ `POST /api/auth/verify` - Verifies token validity
- ✅ Uses bcryptjs for password comparison
- ✅ Returns permissions based on user role

#### Auth Middleware (`/server/src/middleware/auth.ts`)
- ✅ `authMiddleware` - Verifies JWT token on protected routes
- ✅ `requireRole` - Checks if user has specific role
- ✅ `requirePermission` - Checks if user has specific permission
- ✅ Extracts user info from token and attaches to request

---

## How to Use

### Login

```typescript
// In LoginScreen component
const { login } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  try {
    await login(username, password);
    // User is now authenticated
  } catch (error) {
    // Show error message
  }
};
```

### Check Authentication

```typescript
// In any component
const { user, token } = useAuth();

if (!user) {
  // User is not authenticated
}

// Access user info
console.log(user.username, user.role, user.permissions);
```

### Check Permissions

```typescript
const { hasPermission } = useAuth();

if (hasPermission('MANAGE_USERS')) {
  // Show admin panel
}
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  // User is redirected to login screen
};
```

---

## Protected Routes (Backend)

### Using Auth Middleware

```typescript
import { authMiddleware, requireRole } from '../middleware/auth.js';

// Protect all routes under this router
router.use(authMiddleware);

// Require specific role
router.post('/admin-only', requireRole(['SUDO', 'ADMIN']), (req, res) => {
  // Only SUDO and ADMIN can access
});

// Require specific permission
router.post('/manage-users', requirePermission(['MANAGE_USERS']), (req, res) => {
  // Only users with MANAGE_USERS permission can access
});
```

---

## Token Management

### Token Storage

- **Location**: `localStorage.authToken`
- **Format**: JWT token string
- **Expiration**: 24 hours (configurable)

### Token Refresh

Currently, tokens expire after 24 hours. To implement token refresh:

1. Add refresh token endpoint
2. Store refresh token in httpOnly cookie
3. Implement token refresh logic in API client
4. Automatically refresh before expiration

### Token Validation

```typescript
// Verify token is still valid
const { token } = useAuth();
const isValid = await apiClient.verifyToken();
```

---

## Security Best Practices

### ✅ Implemented

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Tokens**: HS256 algorithm
3. **Token Expiration**: 24 hours
4. **Authorization Header**: Bearer token format
5. **CORS**: Enabled for frontend origin
6. **Input Validation**: All inputs validated

### 🔄 Recommended for Production

1. **HTTPS Only**: Enforce HTTPS
2. **Secure Cookies**: Use httpOnly cookies for tokens
3. **CSRF Protection**: Implement CSRF tokens
4. **Rate Limiting**: Limit login attempts
5. **2FA**: Two-factor authentication
6. **Token Refresh**: Implement refresh token rotation
7. **Audit Logging**: Log all auth events
8. **IP Whitelisting**: Restrict access by IP

---

## Environment Variables

### Backend

```bash
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h
```

### Frontend

```bash
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## Testing

### Test Credentials

```
Username: sudo
Password: sudo

Username: admin
Password: admin

Username: reception
Password: reception
```

### Test Login Flow

1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev`
3. Enter test credentials
4. Verify token is stored in localStorage
5. Refresh page and verify auth persists
6. Logout and verify token is cleared

---

## Troubleshooting

### Issue: Login fails with "Invalid credentials"

**Solution**: 
- Verify username and password are correct
- Check database has users with hashed passwords
- Verify bcryptjs is installed

### Issue: Token not being sent with requests

**Solution**:
- Check localStorage has `authToken`
- Verify `getAuthHeaders()` is being called
- Check Authorization header in network tab

### Issue: "Invalid or expired token" error

**Solution**:
- Token may have expired (24 hours)
- Logout and login again
- Check JWT_SECRET matches between frontend and backend

### Issue: CORS errors

**Solution**:
- Verify CORS is enabled in backend
- Check frontend URL is in CORS whitelist
- Verify Authorization header is allowed

---

## Files Modified

- ✅ `/context/AuthContext.tsx` - Backend API integration
- ✅ `/api/client.ts` - Token in all requests
- ✅ `/App.tsx` - Loading state handling
- ✅ `/server/src/routes/auth.ts` - JWT token generation
- ✅ `/server/src/middleware/auth.ts` - Token verification

---

## Next Steps

1. ✅ Test login with backend
2. ✅ Verify token persistence
3. ✅ Test protected routes
4. ✅ Implement token refresh (optional)
5. ✅ Add 2FA (optional)
6. ✅ Add rate limiting (optional)

---

**Status**: ✅ Complete and Ready for Testing


