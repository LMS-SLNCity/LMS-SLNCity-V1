# Quick Authentication Reference

## Test Credentials

```
sudo / sudo           (SUDO - Full Access)
admin / admin         (ADMIN - Admin Subset)
reception / reception (RECEPTION)
phlebo / phlebo       (PHLEBOTOMY)
labtech / labtech     (LAB)
approver / approver   (APPROVER)
```

---

## Quick Test

### 1. Start Backend
```bash
cd server && npm run dev
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Login
- Go to http://localhost:3000
- Use any test credential above
- Should see main layout

---

## API Endpoints

### Authentication
```bash
# Login
POST /api/auth/login
{
  "username": "sudo",
  "password": "sudo"
}

# Verify Token
POST /api/auth/verify
Authorization: Bearer <token>
```

### User Management
```bash
# Get all users
GET /api/users
Authorization: Bearer <token>

# Create user
POST /api/users
Authorization: Bearer <token>
{
  "username": "newuser",
  "password": "password",
  "role": "RECEPTION"
}

# Update user
PATCH /api/users/:id
Authorization: Bearer <token>
{
  "role": "ADMIN",
  "is_active": true
}

# Delete user
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

## Role Permissions

### SUDO (18 permissions)
Full access to all features

### ADMIN (14 permissions)
Admin features except user/role management

### RECEPTION (3 permissions)
- VIEW_RECEPTION
- CREATE_VISIT
- COLLECT_DUE_PAYMENT

### PHLEBOTOMY (2 permissions)
- VIEW_PHLEBOTOMY
- COLLECT_SAMPLE

### LAB (2 permissions)
- VIEW_LAB
- ENTER_RESULTS

### APPROVER (2 permissions)
- VIEW_APPROVER
- APPROVE_RESULTS

---

## Token Management

### Token Storage
- **Location**: `localStorage.authToken`
- **Format**: JWT
- **Expiration**: 24 hours

### Token in Requests
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Check Token in Console
```javascript
// Get token
localStorage.getItem('authToken')

// Get user
JSON.parse(localStorage.getItem('authUser'))

// Decode token (without verification)
const parts = localStorage.getItem('authToken').split('.');
JSON.parse(atob(parts[1]))
```

---

## Troubleshooting

### Login Fails
- Check username and password are correct
- Verify user exists in database
- Check password hash in database

### Token Not Sent
- Check localStorage has authToken
- Verify getAuthHeaders() is called
- Check Network tab for Authorization header

### Invalid Token Error
- Token may have expired (24 hours)
- Logout and login again
- Check JWT_SECRET matches

### Permission Denied
- Check user role has required permission
- Verify role permissions in mock.ts
- Check backend permission middleware

---

## Database Users

```sql
SELECT id, username, role FROM users ORDER BY id;

 id | username  |    role    
----+-----------+------------
  1 | sudo      | SUDO
  2 | admin     | ADMIN
  3 | reception | RECEPTION
  4 | phlebo    | PHLEBOTOMY
  5 | labtech   | LAB
  6 | approver  | APPROVER
```

---

## Files

- **Frontend Auth**: `/context/AuthContext.tsx`
- **API Client**: `/api/client.ts`
- **Backend Auth**: `/server/src/routes/auth.ts`
- **Auth Middleware**: `/server/src/middleware/auth.ts`
- **User Routes**: `/server/src/routes/users.ts`
- **Mock Data**: `/api/mock.ts`

---

## Status

✅ All authentication working correctly
✅ All users can login
✅ All permissions mapped
✅ Delete user functionality added


