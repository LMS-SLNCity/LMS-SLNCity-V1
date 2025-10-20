# Patient QR Code & Online Report Portal Implementation Guide

## Overview
Patients can access their reports through:
1. **QR Code Scanning**: Unique QR code on receipt
2. **Phone Number + Visit Code**: Manual entry
3. **OTP Verification**: Security layer

## Architecture

### QR Code Generation
- Generate unique token per visit
- Encode visit ID + timestamp + hash
- Create QR code image
- Print on receipt

### Access Methods
1. **QR Code**: Scan → Verify OTP → View Report
2. **Phone Number**: Enter phone + visit code → Verify OTP → View Report

## Database Schema

### Visits Table Updates
```sql
ALTER TABLE visits ADD COLUMN qr_code_token VARCHAR(500);
ALTER TABLE visits ADD COLUMN qr_code_generated_at TIMESTAMP;
```

### Patient Report Access Logs Table
```sql
CREATE TABLE patient_report_access_logs (
    id SERIAL PRIMARY KEY,
    visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    access_method VARCHAR(50) NOT NULL CHECK (access_method IN ('QR_CODE', 'PHONE_OTP')),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);
```

## Backend Implementation

### 1. QR Code Generation Route
**File**: `/server/src/routes/patient-reports.ts`

```typescript
// POST /api/patient-reports/generate-qr/:visitId
// Headers: { Authorization: "Bearer <token>" }
// Response: { qrCodeToken: string, qrCodeUrl: string }

// GET /api/patient-reports/qr/:token
// Response: { visitId: number, patientName: string, visitCode: string }
```

### 2. OTP Service
**File**: `/server/src/services/otp-service.ts`

```typescript
// Generate OTP (6 digits)
// Store OTP with expiration (5 minutes)
// Send OTP via SMS/Email
// Verify OTP
```

### 3. Patient Report Routes
**File**: `/server/src/routes/patient-reports.ts`

```typescript
// POST /api/patient-reports/request-otp
// Body: { phoneNumber: string, visitCode: string }
// Response: { message: "OTP sent" }

// POST /api/patient-reports/verify-otp
// Body: { phoneNumber: string, visitCode: string, otp: string }
// Response: { token: string, expiresIn: number }

// GET /api/patient-reports/:token
// Response: { visit: Visit, tests: VisitTest[] }

// GET /api/patient-reports/:token/download
// Response: PDF file

// GET /api/patient-reports/qr/:qrToken
// Response: { visit: Visit, tests: VisitTest[] }
```

## Frontend Implementation

### 1. Patient Report Portal
**File**: `/pages/PatientReportPortal.tsx`

Features:
- Two access methods (QR vs Phone)
- Tab-based navigation
- Loading states
- Error handling

### 2. QR Code Access
**File**: `/components/patient/QRCodeAccess.tsx`

Features:
- QR code scanner (using `qr-scanner` library)
- Manual token entry
- OTP verification
- Report display

### 3. Phone Number Access
**File**: `/components/patient/PhoneNumberAccess.tsx`

Features:
- Phone number input
- Visit code input
- OTP request button
- OTP input field
- OTP timer (5 minutes)
- Resend OTP button

### 4. Report Display
**File**: `/components/patient/PatientReportDisplay.tsx`

Features:
- Display report details
- Download as PDF
- Print option
- Share option (email)
- Expiry warning

## API Endpoints Summary

### QR Code
- `POST /api/patient-reports/generate-qr/:visitId` - Generate QR
- `GET /api/patient-reports/qr/:token` - Get report by QR

### Phone OTP
- `POST /api/patient-reports/request-otp` - Request OTP
- `POST /api/patient-reports/verify-otp` - Verify OTP
- `GET /api/patient-reports/:token` - Get report by token

### Download
- `GET /api/patient-reports/:token/download` - Download PDF

## Implementation Steps

### Step 1: Backend Setup
1. Create patient report routes
2. Implement QR code generation
3. Implement OTP service
4. Add access logging
5. Create PDF generation

### Step 2: Frontend Setup
1. Create patient portal page
2. Create QR code access component
3. Create phone number access component
4. Create report display component
5. Add PDF download

### Step 3: QR Code Integration
1. Generate QR code on visit creation
2. Print QR code on receipt
3. Implement QR scanner
4. Handle QR code verification

### Step 4: OTP Integration
1. Integrate SMS service (Twilio/AWS SNS)
2. Implement OTP generation
3. Implement OTP verification
4. Add OTP expiration

### Step 5: Testing
1. Test QR code generation
2. Test QR code scanning
3. Test phone number access
4. Test OTP verification
5. Test report download

## Security Considerations

1. **Token Expiration**: 24-hour expiration for access tokens
2. **OTP Security**: 6-digit OTP, 5-minute expiration
3. **Rate Limiting**: Limit OTP requests to 3 per hour
4. **IP Logging**: Log IP address for access tracking
5. **HTTPS**: Enforce HTTPS
6. **Input Validation**: Validate phone numbers and visit codes
7. **SQL Injection**: Use parameterized queries
8. **XSS Protection**: Sanitize all outputs

## Libraries Required

### Backend
- `qrcode` - QR code generation
- `twilio` or `aws-sdk` - SMS service
- `pdfkit` or `html2pdf` - PDF generation

### Frontend
- `qr-scanner` - QR code scanning
- `html2pdf` - PDF download
- `react-qr-code` - QR code display

## File Structure

```
/server/src/routes/
  └── patient-reports.ts (NEW)

/server/src/services/
  └── otp-service.ts (NEW)

/pages/
  └── PatientReportPortal.tsx (NEW)

/components/patient/
  ├── QRCodeAccess.tsx (NEW)
  ├── PhoneNumberAccess.tsx (NEW)
  └── PatientReportDisplay.tsx (NEW)

Database:
  └── patient_report_access_logs (NEW)
```

## QR Code Format

```
https://lms.slncity.com/patient-reports/qr/{qrToken}

Where qrToken = base64(visitId + timestamp + hash)
```

## Next Steps

1. Implement QR code generation
2. Create patient portal page
3. Implement OTP service
4. Create QR code scanner
5. Add PDF download
6. Test all features


