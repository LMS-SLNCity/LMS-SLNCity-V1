# LMS-SLNCity Testing Checklist

## Phase 1: Approver Management & Signature System

### Database Tests
- [ ] Verify `branches` table created
- [ ] Verify `b2b_client_logins` table created
- [ ] Verify `patient_report_access_logs` table created
- [ ] Verify `users` table has `signature_image_url` column
- [ ] Verify `users` table has `branch_id` column
- [ ] Verify `visits` table has `qr_code_token` column
- [ ] Verify `visits` table has `qr_code_generated_at` column
- [ ] Verify all indexes created

### Backend API Tests

#### Branches Endpoints
- [ ] `GET /api/branches` - Returns list of branches
- [ ] `GET /api/branches/:id` - Returns specific branch
- [ ] `POST /api/branches` - Creates new branch
- [ ] `PATCH /api/branches/:id` - Updates branch
- [ ] `DELETE /api/branches/:id` - Deletes branch
- [ ] Verify response format (camelCase)
- [ ] Verify error handling

#### Signatures Endpoints
- [ ] `POST /api/signatures/upload/:userId` - Uploads signature
- [ ] `GET /api/signatures/:userId` - Retrieves signature
- [ ] `DELETE /api/signatures/:userId` - Deletes signature
- [ ] Verify base64 encoding/decoding
- [ ] Verify file storage in `/public/signatures/`
- [ ] Verify error handling

### Frontend Component Tests

#### Approver Management
- [ ] Component renders without errors
- [ ] Lists all approvers with APPROVER role
- [ ] Shows signature status (uploaded/not uploaded)
- [ ] "Upload Signature" button works
- [ ] Modal opens on button click
- [ ] Signature preview displays correctly

#### Signature Upload Modal
- [ ] Modal opens and closes properly
- [ ] Canvas drawing mode works
  - [ ] Mouse down starts drawing
  - [ ] Mouse move draws lines
  - [ ] Mouse up stops drawing
  - [ ] Clear button clears canvas
- [ ] File upload mode works
  - [ ] File input accepts images
  - [ ] Preview displays uploaded image
  - [ ] File size validation works
- [ ] Save button submits data
- [ ] Error messages display correctly

#### Branch Management
- [ ] Component renders without errors
- [ ] Lists all branches in table
- [ ] "Add Branch" button works
- [ ] Form opens for new branch
- [ ] Form fields populate correctly
- [ ] Save button creates branch
- [ ] Edit button opens form with data
- [ ] Cancel button closes form
- [ ] Status badge shows correctly

### Integration Tests

#### AppContext
- [ ] Branches state initializes
- [ ] Branches fetch from API
- [ ] Branches update in state
- [ ] Branches available to components

#### API Client
- [ ] `getBranches()` works
- [ ] `createBranch()` works
- [ ] `updateBranch()` works
- [ ] `deleteBranch()` works
- [ ] Error handling works

### UI/UX Tests

#### Approver Management
- [ ] Page layout is clean
- [ ] Table is responsive
- [ ] Buttons are clickable
- [ ] Modal is user-friendly
- [ ] Error messages are clear

#### Branch Management
- [ ] Page layout is clean
- [ ] Form is easy to use
- [ ] Validation messages are clear
- [ ] Table displays data correctly
- [ ] Buttons are properly styled

### Security Tests

#### Signature Upload
- [ ] Only SUDO can upload signatures
- [ ] File size limit enforced (2MB)
- [ ] Only image files accepted
- [ ] Base64 encoding is secure
- [ ] Files stored securely

#### Branch Management
- [ ] Only SUDO can create branches
- [ ] Only SUDO can edit branches
- [ ] Only SUDO can delete branches
- [ ] Input validation works
- [ ] SQL injection prevented

---

## Phase 2: Branch Management Integration

### API Integration Tests
- [ ] Create branch via API
- [ ] Update branch via API
- [ ] Delete branch via API
- [ ] Fetch branches via API
- [ ] Error handling works

### User Assignment Tests
- [ ] Assign user to branch
- [ ] Update user branch
- [ ] Remove user from branch
- [ ] Verify branch_id in database

### Multi-branch Filtering Tests
- [ ] Filter visits by branch
- [ ] Filter reports by branch
- [ ] Filter users by branch
- [ ] Verify data isolation

---

## Phase 3: B2B Client Portal

### Authentication Tests
- [ ] B2B login with valid credentials
- [ ] B2B login with invalid credentials
- [ ] JWT token generation
- [ ] Token validation
- [ ] Token expiration

### Dashboard Tests
- [ ] Client profile displays
- [ ] Current dues show correctly
- [ ] Recent reports display
- [ ] Navigation works

### Reports View Tests
- [ ] List all reports
- [ ] Search by visit code
- [ ] Filter by date range
- [ ] Filter by status
- [ ] Pagination works
- [ ] Download button works

### Transaction History Tests
- [ ] List all transactions
- [ ] Filter by date range
- [ ] Filter by type
- [ ] Pagination works
- [ ] Export to CSV works

---

## Phase 4: Patient QR Portal

### QR Code Tests
- [ ] QR code generates per visit
- [ ] QR code is scannable
- [ ] QR code contains correct data
- [ ] QR code prints on receipt

### OTP Tests
- [ ] OTP generates correctly
- [ ] OTP sends via SMS
- [ ] OTP expires after 5 minutes
- [ ] OTP verification works
- [ ] Rate limiting works

### Patient Portal Tests
- [ ] QR scanner works
- [ ] Phone number access works
- [ ] OTP input works
- [ ] Report displays correctly
- [ ] Download works
- [ ] Print works

### Access Logging Tests
- [ ] Access logged in database
- [ ] IP address captured
- [ ] User agent captured
- [ ] Timestamp recorded

---

## Phase 5: Advanced Features

### Inventory Management Tests
- [ ] Create inventory item
- [ ] Update inventory
- [ ] Track stock levels
- [ ] Low stock alerts
- [ ] Expiry date tracking

### Quality Control Tests
- [ ] QC checklist displays
- [ ] QC results recorded
- [ ] QC approval workflow
- [ ] QC reports generate

### Analytics Tests
- [ ] Volume trends display
- [ ] Revenue analytics show
- [ ] TAT metrics calculate
- [ ] Client performance shows
- [ ] Doctor referral tracking works

### Notifications Tests
- [ ] SMS notifications send
- [ ] Email notifications send
- [ ] WhatsApp notifications send
- [ ] Push notifications send
- [ ] Notification history logs

### Security Tests
- [ ] 2FA setup works
- [ ] 2FA verification works
- [ ] Data encryption works
- [ ] IP whitelisting works
- [ ] Audit trail logs

---

## Performance Tests

- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Concurrent users supported

---

## Browser Compatibility Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

---

## Accessibility Tests

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Form labels present
- [ ] Error messages clear

---

## Test Execution

### Quick Test (15 minutes)
1. [ ] Database migrations run
2. [ ] Backend starts
3. [ ] Frontend starts
4. [ ] Approver Management loads
5. [ ] Branch Management loads
6. [ ] Signature upload works

### Full Test (1 hour)
1. [ ] All database tests pass
2. [ ] All API tests pass
3. [ ] All component tests pass
4. [ ] All integration tests pass
5. [ ] All security tests pass

### Regression Test (2 hours)
1. [ ] All previous tests pass
2. [ ] New features work
3. [ ] No existing features broken
4. [ ] Performance acceptable
5. [ ] Security maintained

---

## Test Results

| Test Category | Status | Notes |
|---------------|--------|-------|
| Database | ⬜ Pending | |
| Backend API | ⬜ Pending | |
| Frontend Components | ⬜ Pending | |
| Integration | ⬜ Pending | |
| Security | ⬜ Pending | |
| Performance | ⬜ Pending | |
| Accessibility | ⬜ Pending | |

---

## Sign-off

- [ ] All tests passed
- [ ] No critical issues
- [ ] Ready for production
- [ ] Documentation complete

**Tested By**: _______________
**Date**: _______________
**Status**: ⬜ Pending


