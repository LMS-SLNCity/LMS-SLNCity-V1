-- Seed test data with visits and approved tests for testing

-- Insert a test patient
INSERT INTO patients (salutation, name, age_years, age_months, age_days, sex, phone, address, email, clinical_history)
VALUES ('Mr', 'John Doe', 35, 0, 0, 'Male', '9876543210', '123 Main St, City', 'john@example.com', 'No known allergies')
ON CONFLICT DO NOTHING;

-- Get the patient ID
WITH patient_data AS (
  SELECT id FROM patients WHERE name = 'John Doe' LIMIT 1
)
-- Insert a visit
INSERT INTO visits (patient_id, referred_doctor_id, ref_customer_id, registration_datetime, total_cost, amount_paid, payment_mode, due_amount)
SELECT p.id, NULL, NULL, NOW(), 500.00, 500.00, 'Cash', 0.00
FROM patient_data p
ON CONFLICT DO NOTHING;

-- Get the visit ID and insert visit tests
WITH visit_data AS (
  SELECT v.id as visit_id FROM visits v 
  JOIN patients p ON v.patient_id = p.id 
  WHERE p.name = 'John Doe' LIMIT 1
),
test_template_data AS (
  SELECT id FROM test_templates WHERE code = 'CBC' LIMIT 1
)
INSERT INTO visit_tests (visit_id, test_template_id, status, collected_by, collected_at, specimen_type, results, approved_by, approved_at)
SELECT vd.visit_id, tt.id, 'APPROVED', 'phlebo', NOW() - INTERVAL '2 hours', 'WB EDTA-2511599', 
  '{"Hemoglobin": 14.5, "WBC": 7500, "Platelets": 250000, "RBC": 4.8}'::jsonb, 'approver', NOW() - INTERVAL '1 hour'
FROM visit_data vd, test_template_data tt
ON CONFLICT DO NOTHING;

