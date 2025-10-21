# LMS-SLNCity Feature Roadmap

## Phase 1: Approver Management & Signature System (PRIORITY 1)

### 1.1 Approver Management Interface (SUDO Only)
**Location**: `components/admin/ApproverManagement.tsx`
- List all APPROVER role users
- Add new approvers with signature image upload
- Edit approver details
- Deactivate/activate approvers
- View signature preview

**Database Changes**:
- Add `signature_image_url` to `users` table
- Add `signature_image_path` to store file path

**Features**:
- Image upload with validation (PNG, JPG, max 2MB)
- Signature preview in list
- Audit trail for approver changes

### 1.2 Signature Management
**Location**: `components/admin/SignatureManagement.tsx`
- Upload/update signature for current user (APPROVER role)
- Preview signature
- Download signature
- Signature validation on report generation

**Backend**:
- File upload endpoint: `POST /api/signatures/upload`
- Get signature: `GET /api/signatures/:userId`
- Update signature: `PATCH /api/signatures/:userId`

### 1.3 Enhanced Approval Flow
**Location**: `components/ApprovalModal.tsx` (Enhanced)
- Show approver name and signature
- Add approval notes/comments
- Timestamp of approval
- Signature preview before final approval

---

## Phase 2: Branch Management (PRIORITY 2)

### 2.1 Branch Details Table
**Database**:
```sql
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Branch Management Interface
**Location**: `components/admin/BranchManagement.tsx`
- Add/edit/delete branches
- View branch details
- Assign users to branches
- Branch-wise report generation

### 2.3 Multi-Branch Support
- Add `branch_id` to users table
- Add `branch_id` to visits table
- Filter data by branch in reports

---

## Phase 3: B2B Client Portal (PRIORITY 3)

### 3.1 B2B Client Profile Page
**Location**: `pages/B2BClientPortal.tsx`
- Client dashboard with real-time dues
- Download all reports (PDF)
- View transaction history
- Payment tracking
- Contact information

**Features**:
- Real-time balance calculation
- Report search and filter
- Bulk download reports
- Payment history with dates

### 3.2 B2B Authentication
- Separate login for B2B clients
- Client ID + Password authentication
- Session management
- Access control (only own reports)

---

## Phase 4: Patient QR Code & Online Report Access (PRIORITY 4)

### 4.1 Patient QR Code System
**Database**:
- Add `qr_code_token` to visits table
- Add `qr_code_generated_at` to visits table

**Features**:
- Generate unique QR code per visit
- QR code contains encrypted visit ID
- Print QR code on receipt

### 4.2 Patient Report Portal
**Location**: `pages/PatientReportPortal.tsx`
- Access reports via QR code scan
- Access reports via phone number + visit code
- View report online
- Download report as PDF
- No authentication required (secure token-based)

**Features**:
- Phone number + OTP verification
- Visit code search
- Report expiry (configurable)
- Download history tracking

---

## Phase 5: Advanced LMS Features (PRIORITY 5)

### 5.1 Inventory Management
- Track test kit inventory
- Low stock alerts
- Supplier management
- Expiry date tracking

### 5.2 Quality Control
- QC checklist per test
- QC approval workflow
- QC report generation
- Trend analysis

### 5.3 Analytics & Reporting
- Test volume analytics
- Revenue analytics
- Turnaround time metrics
- Client-wise performance
- Doctor-wise referral tracking

### 5.4 Notifications
- SMS notifications for reports ready
- Email notifications
- WhatsApp integration
- Push notifications

### 5.5 Integration Features
- LIMS integration with external systems
- HL7 message support
- API for third-party integrations
- Webhook support

### 5.6 Advanced Security
- Two-factor authentication (2FA)
- Role-based access control (RBAC) enhancements
- Data encryption at rest
- Audit trail enhancements
- IP whitelisting

---

## Implementation Priority

1. **Week 1**: Approver Management + Signature System
2. **Week 2**: Branch Management
3. **Week 3**: B2B Client Portal
4. **Week 4**: Patient QR Code + Report Portal
5. **Week 5+**: Advanced Features

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **File Storage**: Local filesystem (can be upgraded to S3)
- **QR Code**: `qrcode.react` library
- **PDF Generation**: `html2pdf` or `pdfkit`
- **Authentication**: JWT tokens
- **Encryption**: bcryptjs for passwords, crypto for tokens

---

## Database Schema Updates Required

1. Add `signature_image_url` to `users` table
2. Create `branches` table
3. Add `branch_id` to `users` table
4. Add `branch_id` to `visits` table
5. Add `qr_code_token` to `visits` table
6. Add `qr_code_generated_at` to `visits` table
7. Create `b2b_client_logins` table for B2B authentication
8. Create `patient_report_access_logs` table for tracking

---

## API Endpoints to Create

### Approver Management
- `POST /api/approvers` - Create approver
- `GET /api/approvers` - List approvers
- `PATCH /api/approvers/:id` - Update approver
- `DELETE /api/approvers/:id` - Delete approver

### Signatures
- `POST /api/signatures/upload` - Upload signature
- `GET /api/signatures/:userId` - Get signature
- `PATCH /api/signatures/:userId` - Update signature

### Branches
- `POST /api/branches` - Create branch
- `GET /api/branches` - List branches
- `PATCH /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### B2B Portal
- `POST /api/b2b/login` - B2B client login
- `GET /api/b2b/profile` - Get client profile
- `GET /api/b2b/reports` - List client reports
- `GET /api/b2b/dues` - Get current dues
- `GET /api/b2b/transactions` - Get transaction history

### Patient Portal
- `POST /api/patient/verify-phone` - Verify phone number
- `POST /api/patient/verify-otp` - Verify OTP
- `GET /api/patient/report/:token` - Get report by QR token
- `GET /api/patient/report/phone/:phone/:visitCode` - Get report by phone


