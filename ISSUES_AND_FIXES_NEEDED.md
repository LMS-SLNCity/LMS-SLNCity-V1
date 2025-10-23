# Critical Issues & Fixes Needed

## 1. ✅ LOGIN - ALREADY USING DATABASE

**Status:** WORKING CORRECTLY

### Current Implementation:
- **File:** `/server/src/routes/auth.ts` (Lines 35-97)
- **Database Query:** `SELECT id, username, password_hash, role, is_active FROM users WHERE username = $1`
- **Password Verification:** Using bcrypt.compare() with database hash
- **Token Generation:** JWT token created after successful authentication
- **Verification:** Token verified against database on each request

**Evidence:**
```typescript
// Line 45-48: Query database for user
const result = await pool.query(
  'SELECT id, username, password_hash, role, is_active FROM users WHERE username = $1',
  [username]
);

// Line 62: Compare with database password hash
const passwordMatch = await bcrypt.compare(password, user.password_hash);
```

✅ **LOGIN IS FULLY DATABASE-DRIVEN**

---

## 2. ❌ BRANCH ISOLATION - NOT IMPLEMENTED

**Status:** NEEDS IMPLEMENTATION

### Current Problem:
- Branches exist as separate entities in database
- BUT data is NOT filtered by branch
- All users see ALL data from ALL branches
- No branch-specific business isolation

### Current Schema:
```sql
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    address TEXT,
    ...
);

CREATE TABLE users (
    branch_id INTEGER REFERENCES branches(id),
    ...
);

CREATE TABLE visits (
    branch_id INTEGER REFERENCES branches(id),
    ...
);
```

### What's Missing:
1. **User-Branch Assignment:** Users not properly assigned to branches
2. **Data Filtering:** Queries don't filter by user's branch
3. **Business Isolation:** Each branch should have separate:
   - Visits and patients
   - Revenue and payments
   - Reports and audit logs
   - Inventory (tests, antibiotics)

### Required Fixes:

#### Step 1: Update User Assignment
```typescript
// In /server/src/routes/users.ts
// When creating user, assign to branch
const result = await pool.query(
  `INSERT INTO users (username, password_hash, role, branch_id, is_active)
   VALUES ($1, $2, $3, $4, $5)`,
  [username, hashedPassword, role, branchId, true]
);
```

#### Step 2: Filter All Queries by Branch
```typescript
// In /server/src/routes/visits.ts
// Add branch filter
const result = await pool.query(
  `SELECT v.* FROM visits v
   WHERE v.branch_id = $1
   ORDER BY v.created_at DESC`,
  [userBranchId]
);
```

#### Step 3: Middleware for Branch Context
```typescript
// In /server/src/middleware/branchContext.ts
export const branchContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user.branchId) {
    return res.status(403).json({ error: 'User not assigned to branch' });
  }
  req.branchId = user.branchId;
  next();
};
```

---

## 3. ❌ REPORT PRINTING - INCLUDES UNWANTED ELEMENTS

**Status:** NEEDS FIX

### Current Problem:
- When printing/downloading report, includes:
  - Browser header/footer with date and time
  - Page margins and browser UI
  - Not just the report content

### Current Implementation:
**File:** `/components/ReportModal.tsx` (Lines 18-23)
```typescript
const handlePrint = (mode: 'full' | 'content-only') => {
  setPrintMode(mode);
  setTimeout(() => {
    window.print();  // ← Uses browser print dialog
  }, 100);
};
```

### Problem:
- `window.print()` uses browser's print dialog
- Includes browser headers/footers
- Date/time added by browser
- Not suitable for professional reports

### Solution: Generate PDF Instead

#### Step 1: Install PDF Library
```bash
npm install jspdf html2canvas
```

#### Step 2: Create PDF Export Function
```typescript
// In /components/ReportModal.tsx
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const handleDownloadPDF = async () => {
  const element = document.getElementById('test-report');
  const canvas = await html2canvas(element, { scale: 2 });
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  pdf.save(`report_${visit.visit_code}.pdf`);
};
```

#### Step 3: Update UI
```typescript
<button onClick={handleDownloadPDF} className="...">
  Download Report (PDF)
</button>
```

---

## 4. ❌ QR CODE & BARCODE - NOT FUNCTIONAL

**Status:** NEEDS IMPLEMENTATION

### Current Problem:
- QR code shown in report (Line 201-204 in TestReport.tsx)
- But it's just SVG placeholder
- Not actually scannable
- No backend functionality

### Current Code:
```typescript
<svg viewBox="0 0 100 100" className="w-20 h-20">
  <path d="M0 0h30v30H0z M10 10h10v10H10z..." fill="#0f172a"/>
</svg>
<p className="text-xxs mt-1 text-gray-700">
  Scan to verify report for Visit ID: {visit.visit_code}
</p>
```

### What's Needed:

#### Step 1: Install QR Code Library
```bash
npm install qrcode.react
```

#### Step 2: Generate Real QR Code
```typescript
// In /components/TestReport.tsx
import QRCode from 'qrcode.react';

// Generate QR code with visit verification URL
const qrValue = `${window.location.origin}/verify-report/${visit.visit_code}`;

<QRCode 
  value={qrValue}
  size={128}
  level="H"
  includeMargin={true}
/>
```

#### Step 3: Create Verification Endpoint
```typescript
// In /server/src/routes/reports.ts
router.get('/verify/:visitCode', async (req: Request, res: Response) => {
  const { visitCode } = req.params;
  
  const result = await pool.query(
    `SELECT v.id, v.visit_code, v.patient_id, v.created_at
     FROM visits v
     WHERE v.visit_code = $1`,
    [visitCode]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  // Log access
  await pool.query(
    `INSERT INTO patient_report_access_logs (visit_id, access_method, ip_address)
     VALUES ($1, 'QR_CODE', $2)`,
    [result.rows[0].id, req.ip]
  );
  
  res.json(result.rows[0]);
});
```

#### Step 4: Create Verification Page
```typescript
// In /components/ReportVerification.tsx
export const ReportVerification: React.FC<{ visitCode: string }> = ({ visitCode }) => {
  const [report, setReport] = useState(null);
  
  useEffect(() => {
    fetch(`/api/reports/verify/${visitCode}`)
      .then(r => r.json())
      .then(setReport);
  }, [visitCode]);
  
  return (
    <div className="p-8">
      <h1>Report Verification</h1>
      {report && (
        <div>
          <p>Visit Code: {report.visit_code}</p>
          <p>Date: {new Date(report.created_at).toLocaleDateString()}</p>
          <p>✅ Report is authentic</p>
        </div>
      )}
    </div>
  );
};
```

---

## Summary of Required Changes

| Issue | Status | Priority | Effort |
|-------|--------|----------|--------|
| Login using DB | ✅ DONE | - | - |
| Branch Isolation | ❌ TODO | 🔴 HIGH | 2-3 days |
| Report PDF Export | ❌ TODO | 🔴 HIGH | 1 day |
| QR Code Functional | ❌ TODO | 🟡 MEDIUM | 1-2 days |
| Barcode Support | ❌ TODO | 🟡 MEDIUM | 1 day |

---

## Implementation Order

1. **First:** Branch Isolation (affects all data)
2. **Second:** Report PDF Export (user-facing)
3. **Third:** QR Code Functionality (verification)
4. **Fourth:** Barcode Support (optional enhancement)

---

## Next Steps

Would you like me to:
1. Implement branch isolation first?
2. Fix report PDF export?
3. Make QR codes functional?
4. All of the above?

Let me know which to prioritize!

