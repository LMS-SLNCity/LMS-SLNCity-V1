# User Management Guide

## Overview

The User Management system now includes complete CRUD operations with soft delete functionality. Users can be created, edited, disabled, and re-enabled without permanently deleting data.

---

## Features

### ✅ Create User
- Add new users with username, password, and role
- Password is automatically hashed with bcryptjs
- User inherits role-based permissions

### ✅ Edit User
- Edit user permissions individually
- Override role-based permissions
- SUDO role permissions cannot be changed

### ✅ Disable User (Soft Delete)
- Disable user account without deleting data
- User cannot login when disabled
- Account can be re-enabled anytime
- Audit log records the action

### ✅ Enable User
- Re-enable disabled user accounts
- User can login again
- Audit log records the action

---

## UI Components

### User Management Tab

Located in Admin Panel → User Management

**Features:**
- Table showing all users with ID, Username, Role, and Status
- Status badge: Green (Active) or Red (Inactive)
- Action buttons: Edit, Disable/Enable

**Actions:**
- **Edit**: Opens permissions modal to customize user permissions
- **Disable**: Soft delete - disables the account (shows for active users)
- **Enable**: Re-enables disabled account (shows for inactive users)

### Create New User Form

**Fields:**
- Username (required)
- Password (required)
- Role (required) - Select from: SUDO, ADMIN, RECEPTION, PHLEBOTOMY, LAB, APPROVER

**Behavior:**
- Form clears after successful creation
- User is created with role-based permissions
- Password is hashed before storage

---

## API Endpoints

### Create User
```bash
POST /api/users
Authorization: Bearer <token>

Request:
{
  "username": "newuser",
  "password": "password123",
  "role": "RECEPTION"
}

Response:
{
  "id": 7,
  "username": "newuser",
  "role": "RECEPTION",
  "is_active": true
}
```

### Get All Users
```bash
GET /api/users
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "username": "sudo",
    "role": "SUDO",
    "is_active": true
  },
  ...
]
```

### Update User
```bash
PATCH /api/users/:id
Authorization: Bearer <token>

Request:
{
  "role": "ADMIN",
  "is_active": true
}

Response:
{
  "id": 1,
  "username": "sudo",
  "role": "ADMIN",
  "is_active": true
}
```

### Disable User (Soft Delete)
```bash
DELETE /api/users/:id
Authorization: Bearer <token>

Response:
{
  "message": "User account disabled successfully",
  "user": {
    "id": 3,
    "username": "reception",
    "role": "RECEPTION",
    "is_active": false
  }
}
```

### Enable User
```bash
POST /api/users/:id/enable
Authorization: Bearer <token>

Response:
{
  "message": "User account enabled successfully",
  "user": {
    "id": 3,
    "username": "reception",
    "role": "RECEPTION",
    "is_active": true
  }
}
```

---

## Frontend Functions

### AppContext Functions

```typescript
// Create user
addUser(userData: UserCreationData, actor: User): void

// Update user permissions
updateUserPermissions(userId: number, permissions: Permission[], actor: User): void

// Disable user account (soft delete)
disableUser(userId: number, actor: User): void

// Enable user account
enableUser(userId: number, actor: User): void
```

### Usage Example

```typescript
const { disableUser, enableUser } = useAppContext();
const { user: actor } = useAuth();

// Disable user
disableUser(userId, actor);

// Enable user
enableUser(userId, actor);
```

---

## Soft Delete vs Hard Delete

### Soft Delete (Current Implementation)
- ✅ Sets `is_active = false`
- ✅ User data remains in database
- ✅ User cannot login
- ✅ Can be re-enabled anytime
- ✅ Audit trail preserved
- ✅ Referential integrity maintained

### Hard Delete (Not Implemented)
- ❌ Permanently removes user record
- ❌ Cannot be undone
- ❌ May break referential integrity
- ❌ Audit trail lost

---

## Audit Logging

All user management actions are logged:

```
Created new user: newuser with role RECEPTION.
Updated permissions for user: admin.
Disabled user account: reception.
Enabled user account: reception.
```

---

## Permissions

### Required Permission
- `MANAGE_USERS` - Required to access User Management tab

### Who Can Manage Users
- SUDO role (all permissions)
- ADMIN role (has MANAGE_USERS permission)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Best Practices

1. **Always use soft delete** - Disable accounts instead of deleting
2. **Audit trail** - All actions are logged for compliance
3. **Password security** - Passwords are hashed with bcryptjs
4. **Role-based permissions** - Users inherit permissions from their role
5. **Custom permissions** - Can override role permissions per user

---

## Troubleshooting

### Issue: Cannot disable user
- **Cause**: Missing MANAGE_USERS permission
- **Fix**: Ensure user has MANAGE_USERS permission

### Issue: Disabled user can still login
- **Cause**: Backend not checking is_active flag
- **Fix**: Verify auth middleware checks is_active

### Issue: User not appearing in list
- **Cause**: User is disabled (is_active = false)
- **Fix**: Enable user or filter to show inactive users

---

## Status

✅ **COMPLETE AND TESTED**

All user management features working:
- Create users ✅
- Edit permissions ✅
- Disable accounts (soft delete) ✅
- Enable accounts ✅
- Audit logging ✅


