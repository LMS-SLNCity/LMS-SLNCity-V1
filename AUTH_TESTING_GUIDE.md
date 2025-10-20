# Authentication Testing Guide

## Quick Start

### 1. Start Backend
```bash
cd server
nvm use 18
npm run dev
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Test Login
- Navigate to http://localhost:3000
- Use credentials: `sudo` / `sudo`
- Should see main layout

---

## Test Cases

### Test 1: Valid Login
**Steps**:
1. Enter username: `sudo`
2. Enter password: `sudo`
3. Click "Sign in"

**Expected**:
- ✅ Login succeeds
- ✅ Redirected to main layout
- ✅ Token stored in localStorage
- ✅ User info displayed in navbar

**Verify**:
```javascript
// In browser console
localStorage.getItem('authToken')  // Should return JWT token
localStorage.getItem('authUser')   // Should return user JSON
```

---

### Test 2: Invalid Password
**Steps**:
1. Enter username: `sudo`
2. Enter password: `wrong`
3. Click "Sign in"

**Expected**:
- ✅ Error message: "Invalid credentials"
- ✅ Stay on login screen
- ✅ No token stored

---

### Test 3: Invalid Username
**Steps**:
1. Enter username: `nonexistent`
2. Enter password: `sudo`
3. Click "Sign in"

**Expected**:
- ✅ Error message: "Invalid credentials"
- ✅ Stay on login screen
- ✅ No token stored

---

### Test 4: Token Persistence
**Steps**:
1. Login with `sudo` / `sudo`
2. Verify you're logged in
3. Refresh page (F5)

**Expected**:
- ✅ Still logged in after refresh
- ✅ No need to login again
- ✅ Token restored from localStorage

---

### Test 5: Logout
**Steps**:
1. Login with `sudo` / `sudo`
2. Click logout button
3. Verify redirected to login

**Expected**:
- ✅ Redirected to login screen
- ✅ Token removed from localStorage
- ✅ User info cleared

---

### Test 6: Different Roles
**Test with each role**:

#### SUDO
- Username: `sudo`
- Password: `sudo`
- Expected: Full access to all features

#### ADMIN
- Username: `admin`
- Password: `admin`
- Expected: Admin panel access

#### RECEPTION
- Username: `reception`
- Password: `reception`
- Expected: Reception features only

#### PHLEBOTOMY
- Username: `phlebotomy`
- Password: `phlebotomy`
- Expected: Phlebotomy features only

#### LAB
- Username: `lab`
- Password: `lab`
- Expected: Lab features only

#### APPROVER
- Username: `approver`
- Password: `approver`
- Expected: Approver features only

---

### Test 7: API Requests with Token
**Steps**:
1. Login with `sudo` / `sudo`
2. Open browser DevTools (F12)
3. Go to Network tab
4. Perform any action (create visit, etc.)
5. Check request headers

**Expected**:
- ✅ Authorization header present
- ✅ Format: `Bearer <token>`
- ✅ Token matches localStorage

**Verify**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Test 8: Protected Routes
**Steps**:
1. Logout
2. Try to access API directly:
   ```
   curl http://localhost:5001/api/users
   ```

**Expected**:
- ✅ Error: "No token provided"
- ✅ Status: 401 Unauthorized

**With Token**:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/users
```

**Expected**:
- ✅ Returns user list
- ✅ Status: 200 OK

---

### Test 9: Expired Token (Manual)
**Steps**:
1. Login and get token
2. Modify token in localStorage (change a character)
3. Try to perform an action

**Expected**:
- ✅ Error: "Invalid or expired token"
- ✅ Redirected to login

---

### Test 10: Permission Checks
**Steps**:
1. Login with `reception` (limited permissions)
2. Try to access Admin Panel

**Expected**:
- ✅ Admin Panel not visible
- ✅ Or shows "Insufficient permissions"

---

## API Testing

### Test Login Endpoint
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sudo","password":"sudo"}'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "username": "sudo",
  "role": "SUDO",
  "isActive": true,
  "permissions": [...]
}
```

### Test Verify Token
```bash
curl -X POST http://localhost:5001/api/auth/verify \
  -H "Authorization: Bearer <token>"
```

**Expected Response**:
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "sudo",
    "role": "SUDO"
  }
}
```

### Test Protected Route
```bash
curl http://localhost:5001/api/users \
  -H "Authorization: Bearer <token>"
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "username": "sudo",
    "role": "SUDO",
    ...
  },
  ...
]
```

---

## Debugging

### Check Token in Console
```javascript
// Get token
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Decode token (without verification)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Payload:', payload);
```

### Check Auth State
```javascript
// In React component
const { user, token, isLoading } = useAuth();
console.log('User:', user);
console.log('Token:', token);
console.log('Loading:', isLoading);
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "XHR" or "Fetch"
4. Check Authorization header in request
5. Check response status and body

---

## Common Issues

### Issue: "No token provided"
- **Cause**: Token not in localStorage
- **Fix**: Login again

### Issue: "Invalid credentials"
- **Cause**: Wrong username/password
- **Fix**: Check credentials in database

### Issue: CORS error
- **Cause**: Frontend and backend on different origins
- **Fix**: Check CORS configuration in backend

### Issue: Token not sent with requests
- **Cause**: `getAuthHeaders()` not being called
- **Fix**: Verify all API methods use `getAuthHeaders()`

---

## Success Criteria

- ✅ Login works with valid credentials
- ✅ Login fails with invalid credentials
- ✅ Token stored in localStorage
- ✅ Token persists on page refresh
- ✅ Token sent with all API requests
- ✅ Protected routes require token
- ✅ Different roles have different permissions
- ✅ Logout clears token

---

**Status**: Ready for Testing ✅


