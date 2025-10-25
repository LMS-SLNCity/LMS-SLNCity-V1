# Test Report Verification Guide

## Overview
This document describes the Playwright test suite for verifying the Test Report template implementation for Sri Lakshmi Narasimha City Diagnostic Center.

## Report Template Structure

### Patient Information Section
- **Left Column**: Patient Name, Age/Gender, Sample Type, Client Code, Referred By
- **Right Column**: Barcode, Patient ID, Sample Drawn Date, Registration Date, Reported Date

### Test Results Section
- **Category Headers**: Gray background with category name (e.g., HEMATOLOGY)
- **Table Headers**: TEST DESCRIPTION | RESULT | UNITS | BIOLOGICAL REFERENCE RANGE
- **Test Rows**: Test name (bold) followed by parameter rows
- **End Marker**: "** End of Report **"

### Footer Section
- **Screen View**: Signature line (left), QR Code (center), Disclaimer notes (right)
- **Print View**: 
  - Left: Signature line for "DR MISBHA LATEEFA, MD - Consultant Pathologist"
  - Center: QR Code
  - Right: Signature line for "T.V. SUBBARAO - M.Sc., Bio-Chemist"
  - Disclaimer text and "Page 1 of 1"

## Running Tests

### Prerequisites
1. Node.js and npm installed
2. Application running on `http://localhost:5173`
3. Backend API running on `http://localhost:3000`

### Install Playwright
```bash
npm install -D @playwright/test
```

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test tests/report.spec.ts
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Generate HTML Report
```bash
npx playwright test
npx playwright show-report
```

## Test Cases

### 1. Patient Information Display
- **Test**: `should display patient information section`
- **Verifies**: All patient fields are visible (Name, Age/Gender, Sample Type, Client Code, Referred By)

### 2. Barcode Display
- **Test**: `should display barcode on right side`
- **Verifies**: Barcode SVG is rendered and visible

### 3. Patient ID
- **Test**: `should display patient ID below barcode`
- **Verifies**: Patient ID label and value are displayed

### 4. Date Fields
- **Test**: `should display all date fields`
- **Verifies**: Sample Drawn Date, Registration Date, Reported Date are visible

### 5. Category Headers
- **Test**: `should display category headers with gray background`
- **Verifies**: Category headers have gray background styling

### 6. Table Structure
- **Test**: `should display test results table with correct columns`
- **Verifies**: All table headers are present (TEST DESCRIPTION, RESULT, UNITS, BIOLOGICAL REFERENCE RANGE)

### 7. Test Names
- **Test**: `should display test names as bold rows`
- **Verifies**: Test names appear as bold rows in the table

### 8. End of Report
- **Test**: `should display end of report marker`
- **Verifies**: "** End of Report **" text is visible

### 9. Footer Content
- **Test**: `should display footer with signature lines`
- **Verifies**: Disclaimer text and notes are visible

### 10. PDF Export
- **Test**: `should export to PDF successfully`
- **Verifies**: PDF export functionality works and generates file

### 11. Lab Name
- **Test**: `should display lab name in screen header`
- **Verifies**: "Sri Lakshmi Narasimha City Diagnostic Center" is displayed

### 12. Layout & Spacing
- **Test**: `should have proper spacing and alignment`
- **Verifies**: Report has proper dimensions and layout

### 13. Date Format
- **Test**: `should display dates in correct format`
- **Verifies**: Dates follow DD-MM-YYYY HH:MM format

### 14. Required Fields
- **Test**: `should have all required patient fields`
- **Verifies**: All 9 required patient fields are present

### 15. Modal Close
- **Test**: `should close report modal`
- **Verifies**: Close button works and modal closes

### 16. QR Code
- **Test**: `should display QR code in footer`
- **Verifies**: QR code SVG is rendered

### 17. Table Borders
- **Test**: `should have table with proper borders`
- **Verifies**: Tables have proper border styling

### 18. Signatory Names
- **Test**: `should display print footer with signatory names`
- **Verifies**: Both signatory names appear in the report

## Test Results Interpretation

### Passing Tests ✅
- All elements are rendered correctly
- Layout matches the template
- Data is displayed properly
- Print functionality works

### Failing Tests ❌
- Check browser console for errors
- Verify test data exists in database
- Ensure backend API is running
- Check network requests in DevTools

## Debugging

### Enable Screenshots
Tests automatically capture screenshots on failure in `test-results/` directory.

### View Trace
```bash
npx playwright show-trace test-results/trace.zip
```

### Check Console Logs
```bash
npx playwright test --debug
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Playwright tests
  run: npx playwright test
  
- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Performance Metrics

- **Build Time**: ~1.8-2.0 seconds
- **Test Execution**: ~30-60 seconds per test file
- **Report Generation**: ~5-10 seconds

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if backend API is responding
- Verify network connectivity

### Element Not Found
- Check if selectors are correct
- Verify test data exists
- Check browser console for errors

### PDF Export Fails
- Ensure print styles are applied
- Check browser print settings
- Verify html2canvas and jsPDF are loaded

## Files Modified

- `/components/TestReport.tsx` - Report template implementation
- `/components/ReportModal.tsx` - Report modal wrapper
- `/tests/report.spec.ts` - Playwright test suite
- `/playwright.config.ts` - Playwright configuration

## Next Steps

1. Run tests locally to verify implementation
2. Fix any failing tests
3. Integrate into CI/CD pipeline
4. Monitor test results in production

