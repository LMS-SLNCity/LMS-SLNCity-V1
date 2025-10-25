# Quick Test Execution Guide

## Prerequisites
1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   # or
   npm start
   ```

2. **Start Frontend Dev Server** (in another terminal)
   ```bash
   npm run dev
   # Frontend will be available at http://localhost:5173
   ```

3. **Ensure Database is Running**
   - PostgreSQL should be running
   - Database should have test data

## Install Playwright (First Time Only)
```bash
npm install -D @playwright/test
```

## Run Tests

### Option 1: Run All Tests
```bash
npx playwright test
```

### Option 2: Run Tests in UI Mode (Recommended for Development)
```bash
npx playwright test --ui
```
This opens an interactive browser where you can:
- Watch tests run in real-time
- Step through each test
- Inspect elements
- See detailed logs

### Option 3: Run Specific Test File
```bash
npx playwright test tests/report.spec.ts
```

### Option 4: Run Specific Test
```bash
npx playwright test -g "should display patient information section"
```

### Option 5: Debug Mode
```bash
npx playwright test --debug
```
Opens Playwright Inspector for step-by-step debugging.

### Option 6: Run in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

## View Test Results

### HTML Report
```bash
npx playwright show-report
```
Opens detailed HTML report with:
- Test results
- Screenshots on failure
- Video recordings
- Trace files

### Console Output
Tests print results to console with:
- ✓ Passed tests
- ✗ Failed tests
- ⊘ Skipped tests

## Test Coverage

The test suite verifies:

✅ **Patient Information**
- All patient fields displayed correctly
- Proper formatting and alignment

✅ **Barcode & Patient ID**
- Barcode rendered and visible
- Patient ID displayed below barcode

✅ **Date Fields**
- Sample Drawn Date
- Registration Date
- Reported Date
- Correct date format (DD-MM-YYYY HH:MM)

✅ **Test Results Table**
- Category headers with gray background
- Table headers: TEST DESCRIPTION, RESULT, UNITS, BIOLOGICAL REFERENCE RANGE
- Test names as bold rows
- Parameter rows with data

✅ **End of Report**
- "** End of Report **" marker displayed

✅ **Footer**
- Signature lines
- QR code
- Disclaimer text
- Signatory names (DR MISBHA LATEEFA, MD & T.V. SUBBARAO)

✅ **Functionality**
- PDF export works
- Modal can be closed
- Proper spacing and alignment
- Lab name displayed

## Expected Test Results

All 18 tests should **PASS** ✅

```
✓ should display patient information section
✓ should display barcode on right side
✓ should display patient ID below barcode
✓ should display all date fields
✓ should display category headers with gray background
✓ should display test results table with correct columns
✓ should display test names as bold rows
✓ should display end of report marker
✓ should display footer with signature lines
✓ should export to PDF successfully
✓ should display lab name in screen header
✓ should have proper spacing and alignment
✓ should display dates in correct format
✓ should have all required patient fields
✓ should close report modal
✓ should display QR code in footer
✓ should have table with proper borders
✓ should display print footer with signatory names

18 passed (45s)
```

## Troubleshooting

### Tests Won't Start
```bash
# Check if ports are in use
lsof -i :5173  # Frontend
lsof -i :3000  # Backend

# Kill process if needed
kill -9 <PID>
```

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check backend API is responding
- Verify database connection

### Element Not Found
- Check if test data exists in database
- Verify selectors in test file
- Check browser console for errors

### PDF Export Fails
- Ensure print styles are applied
- Check if html2canvas is loaded
- Verify jsPDF is available

## CI/CD Integration

### GitHub Actions
Add to `.github/workflows/test.yml`:
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Tips

1. **Run tests in parallel** (default)
   - Tests run faster on multi-core systems

2. **Use headed mode only for debugging**
   - Headless mode is faster

3. **Run specific tests during development**
   - Faster feedback loop

4. **Use UI mode for interactive debugging**
   - Better for understanding failures

## Next Steps

1. ✅ Run tests locally
2. ✅ Verify all tests pass
3. ✅ Check HTML report for details
4. ✅ Integrate into CI/CD
5. ✅ Monitor test results

## Support

For issues or questions:
1. Check `TEST_REPORT_VERIFICATION.md` for detailed documentation
2. Review test output and screenshots
3. Check browser console for errors
4. Verify test data in database

